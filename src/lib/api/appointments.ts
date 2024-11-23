import { supabase } from '../supabase';
import type { Appointment } from '../types';
import { isWithinInterval, parseISO, addMinutes, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { sendTelegramAppointmentNotification, sendTelegramCancellationNotification } from '../notifications/telegram';

export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (
        id,
        name,
        phone,
        email
      ),
      services (
        id,
        name,
        duration,
        price
      ),
      staff (
        id,
        name,
        specialty,
        telegram_bot_token,
        telegram_chat_id
      )
    `)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Ошибка при загрузке записей');
  }

  return data.map(appointment => ({
    ...appointment,
    client: appointment.clients,
    service: appointment.services,
    staff: appointment.staff
  }));
}

export async function createAppointment(appointment: Omit<Appointment, 'id'>) {
  try {
    // Validate required fields
    if (!appointment.service_id) throw new Error('Выберите услугу');
    if (!appointment.staff_id) throw new Error('Выберите специалиста');
    if (!appointment.start_time) throw new Error('Выберите время');
    if (!appointment.end_time) throw new Error('Некорректное время окончания');
    if (!appointment.client?.name) throw new Error('Введите имя клиента');
    if (!appointment.client?.phone) throw new Error('Введите телефон клиента');

    // Validate phone format
    const phoneRegex = /^\+?[0-9]{10,12}$/;
    const cleanPhone = appointment.client.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error('Неверный формат номера телефона');
    }

    let clientId = appointment.client_id;
    
    if (!clientId && appointment.client) {
      // Check for existing client
      const { data: existingClient, error: findError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', cleanPhone)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding client:', findError);
        throw new Error('Ошибка при поиске клиента');
      }

      if (existingClient) {
        clientId = existingClient.id;
        
        // Update existing client info
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            name: appointment.client.name,
            email: appointment.client.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (updateError) {
          console.error('Error updating client:', updateError);
          throw new Error('Ошибка при обновлении данных клиента');
        }
      } else {
        // Create new client
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            name: appointment.client.name,
            phone: cleanPhone,
            email: appointment.client.email
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating client:', insertError);
          throw new Error('Ошибка при создании клиента');
        }
        
        clientId = newClient.id;
      }
    }

    if (!clientId) {
      throw new Error('Не указаны данные клиента');
    }

    // Check staff availability
    const isAvailable = await checkStaffAvailability(
      appointment.staff_id,
      appointment.start_time,
      appointment.end_time
    );

    if (!isAvailable) {
      throw new Error('Выбранный специалист занят в это время');
    }

    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        client_id: clientId,
        service_id: appointment.service_id,
        staff_id: appointment.staff_id,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status || 'pending',
        notes: appointment.notes
      }])
      .select(`
        *,
        clients (
          id,
          name,
          phone,
          email
        ),
        services (
          id,
          name,
          duration,
          price
        ),
        staff (
          id,
          name,
          specialty,
          telegram_bot_token,
          telegram_chat_id
        )
      `)
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Ошибка при создании записи');
    }

    // Send Telegram notification
    if (data.staff.telegram_bot_token && data.staff.telegram_chat_id) {
      try {
        await sendTelegramAppointmentNotification(data.staff, {
          clientName: data.clients.name,
          serviceName: data.services.name,
          date: format(parseISO(data.start_time), 'd MMMM yyyy', { locale: ru }),
          time: format(parseISO(data.start_time), 'HH:mm'),
          status: data.status,
          notes: data.notes
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't throw here, as the appointment was created successfully
      }
    }

    return {
      ...data,
      client: data.clients,
      service: data.services,
      staff: data.staff
    };
  } catch (error) {
    console.error('Appointment creation error:', error);
    if (error instanceof Error) {
      throw error; // Preserve the original error message
    }
    throw new Error('Ошибка при создании записи');
  }
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...appointment,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        clients (
          id,
          name,
          phone,
          email
        ),
        services (
          id,
          name,
          duration,
          price
        ),
        staff (
          id,
          name,
          specialty,
          telegram_bot_token,
          telegram_chat_id
        )
      `)
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      throw new Error('Ошибка при обновлении записи');
    }

    // Send cancellation notification if status changed to cancelled
    if (appointment.status === 'cancelled' && data.staff.telegram_bot_token && data.staff.telegram_chat_id) {
      try {
        await sendTelegramCancellationNotification(data.staff, {
          clientName: data.clients.name,
          serviceName: data.services.name,
          date: format(parseISO(data.start_time), 'd MMMM yyyy', { locale: ru }),
          time: format(parseISO(data.start_time), 'HH:mm'),
          reason: appointment.notes
        });
      } catch (notificationError) {
        console.error('Error sending cancellation notification:', notificationError);
      }
    }

    return {
      ...data,
      client: data.clients,
      service: data.services,
      staff: data.staff
    };
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ошибка при обновлении записи');
  }
}

export async function deleteAppointment(id: string) {
  try {
    // Get appointment details before deletion for notification
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (name),
        services (name),
        staff (
          id,
          name,
          telegram_bot_token,
          telegram_chat_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the appointment
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Send cancellation notification
    if (appointment.staff.telegram_bot_token && appointment.staff.telegram_chat_id) {
      try {
        await sendTelegramCancellationNotification(appointment.staff, {
          clientName: appointment.clients.name,
          serviceName: appointment.services.name,
          date: format(parseISO(appointment.start_time), 'd MMMM yyyy', { locale: ru }),
          time: format(parseISO(appointment.start_time), 'HH:mm')
        });
      } catch (notificationError) {
        console.error('Error sending cancellation notification:', notificationError);
      }
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ошибка при удалении записи');
  }
}

export async function checkStaffAvailability(
  staffId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  try {
    const { data: isAvailable, error } = await supabase
      .rpc('check_staff_availability', {
        p_staff_id: staffId,
        p_date: format(parseISO(startTime), 'yyyy-MM-dd'),
        p_start_time: format(parseISO(startTime), 'HH:mm:ss'),
        p_end_time: format(parseISO(endTime), 'HH:mm:ss')
      });

    if (error) {
      console.error('Error checking availability:', error);
      throw new Error('Ошибка при проверке доступности');
    }

    return isAvailable;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw new Error('Ошибка при проверке доступности');
  }
}

export async function getAvailableTimeSlots(
  staffId: string,
  date: string,
  duration: string
): Promise<Array<{ start_time: string; end_time: string }>> {
  try {
    const { data: slots, error } = await supabase
      .rpc('get_staff_available_slots', {
        p_staff_id: staffId,
        p_date: date,
        p_duration: duration
      });

    if (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Ошибка при получении доступного времени');
    }

    // Filter out past slots for today
    const now = new Date();
    return (slots || []).filter(slot => {
      const slotStart = parseISO(slot.start_time);
      return slotStart > now;
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw new Error('Ошибка при получении доступного времени');
  }
}