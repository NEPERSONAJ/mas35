import { supabase } from '../supabase';
import type { Staff, WorkingHours, TimeOff } from '../types';
import { sendTelegramAvailabilityUpdate } from '../notifications/telegram';

export async function getStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select(`
      *,
      staff_services (
        service_id
      ),
      staff_working_hours (
        *,
        breaks:staff_breaks(*)
      ),
      staff_time_off (*)
    `)
    .order('name');

  if (error) throw error;

  return data.map((staff: any) => ({
    ...staff,
    serviceIds: staff.staff_services?.map((ss: any) => ss.service_id) || [],
    workingHours: staff.staff_working_hours || [],
    timeOff: staff.staff_time_off || []
  }));
}

export async function getStaffMember(id: string) {
  const { data, error } = await supabase
    .from('staff')
    .select(`
      *,
      staff_services (
        service_id
      ),
      staff_working_hours (
        *,
        breaks:staff_breaks(*)
      ),
      staff_time_off (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    serviceIds: data.staff_services?.map((ss: any) => ss.service_id) || [],
    workingHours: data.staff_working_hours || [],
    timeOff: data.staff_time_off || []
  };
}

export async function createStaff(staff: Omit<Staff, 'id'>, serviceIds: string[]) {
  const { data, error } = await supabase
    .from('staff')
    .insert([{
      name: staff.name,
      specialty: staff.specialty,
      bio: staff.bio,
      image_url: staff.image_url,
      phone: staff.phone,
      email: staff.email,
      telegram_bot_token: staff.telegram_bot_token,
      telegram_chat_id: staff.telegram_chat_id,
      is_active: staff.is_active
    }])
    .select()
    .single();

  if (error) throw error;

  if (serviceIds.length > 0) {
    const { error: servicesError } = await supabase
      .from('staff_services')
      .insert(
        serviceIds.map(serviceId => ({
          staff_id: data.id,
          service_id: serviceId
        }))
      );

    if (servicesError) throw servicesError;
  }

  // Send Telegram notification
  await sendTelegramAvailabilityUpdate(data.id, {
    staffName: data.name,
    type: 'staff_created',
    details: `Новый сотрудник: ${data.specialty}`
  });

  return data;
}

export async function updateStaff(id: string, staff: Partial<Staff>, serviceIds?: string[]) {
  const { data, error } = await supabase
    .from('staff')
    .update({
      name: staff.name,
      specialty: staff.specialty,
      bio: staff.bio,
      image_url: staff.image_url,
      phone: staff.phone,
      email: staff.email,
      telegram_bot_token: staff.telegram_bot_token,
      telegram_chat_id: staff.telegram_chat_id,
      is_active: staff.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (serviceIds !== undefined) {
    // Delete existing services
    const { error: deleteError } = await supabase
      .from('staff_services')
      .delete()
      .eq('staff_id', id);

    if (deleteError) throw deleteError;

    // Insert new services
    if (serviceIds.length > 0) {
      const { error: servicesError } = await supabase
        .from('staff_services')
        .insert(
          serviceIds.map(serviceId => ({
            staff_id: id,
            service_id: serviceId
          }))
        );

      if (servicesError) throw servicesError;
    }
  }

  // Send Telegram notification
  await sendTelegramAvailabilityUpdate(id, {
    staffName: data.name,
    type: 'staff_updated',
    details: `Обновлена информация: ${data.specialty}`
  });

  return data;
}

export async function deleteStaff(id: string) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Send Telegram notification
  if (staffData) {
    await sendTelegramAvailabilityUpdate(id, {
      staffName: staffData.name,
      type: 'staff_deleted',
      details: 'Сотрудник удален'
    });
  }
}

export async function getStaffWorkingHours(staffId: string): Promise<WorkingHours[]> {
  const { data, error } = await supabase
    .from('staff_working_hours')
    .select(`
      *,
      breaks:staff_breaks(*)
    `)
    .eq('staff_id', staffId)
    .order('created_at');

  if (error) throw error;
  return data;
}

export async function createWorkingHours(workingHours: Omit<WorkingHours, 'id'>) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', workingHours.staff_id)
    .single();

  const { data, error } = await supabase
    .from('staff_working_hours')
    .insert([{
      staff_id: workingHours.staff_id,
      pattern: workingHours.pattern,
      weekday: workingHours.weekday,
      start_date: workingHours.start_date,
      end_date: workingHours.end_date,
      day_of_week: workingHours.day_of_week,
      week_of_month: workingHours.week_of_month,
      start_time: workingHours.start_time,
      end_time: workingHours.end_time,
      is_active: workingHours.is_active
    }])
    .select()
    .single();

  if (error) throw error;

  // Add breaks if provided
  if (workingHours.breaks && workingHours.breaks.length > 0) {
    const { error: breaksError } = await supabase
      .from('staff_breaks')
      .insert(
        workingHours.breaks.map(breakItem => ({
          working_hours_id: data.id,
          start_time: breakItem.start_time,
          end_time: breakItem.end_time
        }))
      );

    if (breaksError) throw breaksError;
  }

  // Send Telegram notification
  if (staffData) {
    let details = '';
    switch (workingHours.pattern) {
      case 'weekly':
        details = `${workingHours.weekday}, ${workingHours.start_time}-${workingHours.end_time}`;
        break;
      case 'specific_dates':
        details = `${workingHours.start_date} - ${workingHours.end_date}, ${workingHours.start_time}-${workingHours.end_time}`;
        break;
      case 'recurring_day':
        details = `${workingHours.week_of_month}-й ${workingHours.day_of_week} месяца, ${workingHours.start_time}-${workingHours.end_time}`;
        break;
    }

    await sendTelegramAvailabilityUpdate(workingHours.staff_id, {
      staffName: staffData.name,
      type: 'working_hours',
      details
    });
  }

  return data;
}

export async function updateWorkingHours(
  id: string,
  workingHours: Partial<WorkingHours>
) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', workingHours.staff_id!)
    .single();

  const { data, error } = await supabase
    .from('staff_working_hours')
    .update({
      pattern: workingHours.pattern,
      weekday: workingHours.weekday,
      start_date: workingHours.start_date,
      end_date: workingHours.end_date,
      day_of_week: workingHours.day_of_week,
      week_of_month: workingHours.week_of_month,
      start_time: workingHours.start_time,
      end_time: workingHours.end_time,
      is_active: workingHours.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update breaks if provided
  if (workingHours.breaks) {
    // Delete existing breaks
    const { error: deleteError } = await supabase
      .from('staff_breaks')
      .delete()
      .eq('working_hours_id', id);

    if (deleteError) throw deleteError;

    // Insert new breaks
    if (workingHours.breaks.length > 0) {
      const { error: breaksError } = await supabase
        .from('staff_breaks')
        .insert(
          workingHours.breaks.map(breakItem => ({
            working_hours_id: id,
            start_time: breakItem.start_time,
            end_time: breakItem.end_time
          }))
        );

      if (breaksError) throw breaksError;
    }
  }

  // Send Telegram notification
  if (staffData) {
    let details = '';
    switch (workingHours.pattern) {
      case 'weekly':
        details = `${workingHours.weekday}, ${workingHours.start_time}-${workingHours.end_time}`;
        break;
      case 'specific_dates':
        details = `${workingHours.start_date} - ${workingHours.end_date}, ${workingHours.start_time}-${workingHours.end_time}`;
        break;
      case 'recurring_day':
        details = `${workingHours.week_of_month}-й ${workingHours.day_of_week} месяца, ${workingHours.start_time}-${workingHours.end_time}`;
        break;
    }

    await sendTelegramAvailabilityUpdate(workingHours.staff_id!, {
      staffName: staffData.name,
      type: 'working_hours',
      details: `Обновлено: ${details}`
    });
  }

  return data;
}

export async function deleteWorkingHours(id: string, staffId: string) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', staffId)
    .single();

  const { error } = await supabase
    .from('staff_working_hours')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Send Telegram notification
  if (staffData) {
    await sendTelegramAvailabilityUpdate(staffId, {
      staffName: staffData.name,
      type: 'working_hours',
      details: 'Удалено расписание'
    });
  }
}

export async function getStaffTimeOff(staffId: string): Promise<TimeOff[]> {
  const { data, error } = await supabase
    .from('staff_time_off')
    .select('*')
    .eq('staff_id', staffId)
    .order('start_date');

  if (error) throw error;
  return data;
}

export async function createTimeOff(timeOff: Omit<TimeOff, 'id'>) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', timeOff.staff_id)
    .single();

  const { data, error } = await supabase
    .from('staff_time_off')
    .insert([timeOff])
    .select()
    .single();

  if (error) throw error;

  // Send Telegram notification
  if (staffData) {
    await sendTelegramAvailabilityUpdate(timeOff.staff_id, {
      staffName: staffData.name,
      type: 'time_off',
      details: `${timeOff.start_date} - ${timeOff.end_date}${timeOff.reason ? ` (${timeOff.reason})` : ''}`
    });
  }

  return data;
}

export async function updateTimeOff(id: string, timeOff: Partial<TimeOff>) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', timeOff.staff_id!)
    .single();

  const { data, error } = await supabase
    .from('staff_time_off')
    .update({
      start_date: timeOff.start_date,
      end_date: timeOff.end_date,
      reason: timeOff.reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Send Telegram notification
  if (staffData) {
    await sendTelegramAvailabilityUpdate(timeOff.staff_id!, {
      staffName: staffData.name,
      type: 'time_off',
      details: `Обновлено: ${timeOff.start_date} - ${timeOff.end_date}${timeOff.reason ? ` (${timeOff.reason})` : ''}`
    });
  }

  return data;
}

export async function deleteTimeOff(id: string, staffId: string) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', staffId)
    .single();

  const { error } = await supabase
    .from('staff_time_off')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Send Telegram notification
  if (staffData) {
    await sendTelegramAvailabilityUpdate(staffId, {
      staffName: staffData.name,
      type: 'time_off',
      details: 'Удален период отсутствия'
    });
  }
}

export async function checkStaffAvailability(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_staff_availability', {
      p_staff_id: staffId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime
    });

  if (error) throw error;
  return data;
}

export async function getStaffAvailableSlots(
  staffId: string,
  date: string,
  duration: string
): Promise<Array<{ start_time: string; end_time: string }>> {
  const { data, error } = await supabase
    .rpc('get_staff_available_slots', {
      p_staff_id: staffId,
      p_date: date,
      p_duration: duration
    });

  if (error) throw error;
  return data;
}