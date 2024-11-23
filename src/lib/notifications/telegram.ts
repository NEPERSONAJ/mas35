import { supabase } from '../supabase';
import type { Staff } from '../types';

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  parse_mode: 'HTML' | 'Markdown' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const payload: TelegramMessage = {
      chat_id: chatId,
      text: message,
      parse_mode
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export async function sendTelegramAppointmentNotification(
  staff: Staff,
  appointmentData: {
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
    status: string;
    notes?: string;
  }
): Promise<boolean> {
  if (!staff.telegram_bot_token || !staff.telegram_chat_id) {
    console.log('Staff Telegram credentials not found');
    return false;
  }

  const message = `
🔔 <b>Новая запись</b>

👤 Клиент: ${appointmentData.clientName}
💆‍♂️ Услуга: ${appointmentData.serviceName}
📅 Дата: ${appointmentData.date}
⏰ Время: ${appointmentData.time}
📊 Статус: ${appointmentData.status}
${appointmentData.notes ? `\n📝 Заметки: ${appointmentData.notes}` : ''}

<i>Пожалуйста, проверьте детали в админ-панели.</i>
`;

  return sendTelegramMessage(staff.telegram_bot_token, staff.telegram_chat_id, message);
}

export async function sendTelegramAvailabilityUpdate(
  staffId: string,
  updateData: {
    staffName: string;
    type: 'working_hours' | 'time_off' | 'staff_created' | 'staff_updated' | 'staff_deleted';
    details: string;
  }
): Promise<boolean> {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('telegram_bot_token, telegram_chat_id')
      .eq('id', staffId)
      .single();

    if (error || !staff?.telegram_bot_token || !staff?.telegram_chat_id) {
      console.log('Staff Telegram credentials not found:', error);
      return false;
    }

    const message = `
📋 <b>Обновление расписания</b>

👨‍⚕️ Специалист: ${updateData.staffName}
🔄 Тип изменения: ${updateData.type === 'working_hours' ? 'Рабочие часы' : 'Отпуск/выходной'}
ℹ️ Детали: ${updateData.details}

<i>Обновите график в системе бронирования.</i>
`;

    return sendTelegramMessage(staff.telegram_bot_token, staff.telegram_chat_id, message);
  } catch (error) {
    console.error('Error sending Telegram availability update:', error);
    return false;
  }
}

export async function sendTelegramCancellationNotification(
  staff: Staff,
  appointmentData: {
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
    reason?: string;
  }
): Promise<boolean> {
  if (!staff.telegram_bot_token || !staff.telegram_chat_id) {
    console.log('Staff Telegram credentials not found');
    return false;
  }

  const message = `
❌ <b>Отмена записи</b>

👤 Клиент: ${appointmentData.clientName}
💆‍♂️ Услуга: ${appointmentData.serviceName}
📅 Дата: ${appointmentData.date}
⏰ Время: ${appointmentData.time}
${appointmentData.reason ? `\n❓ Причина: ${appointmentData.reason}` : ''}

<i>Время освободилось для новых записей.</i>
`;

  return sendTelegramMessage(staff.telegram_bot_token, staff.telegram_chat_id, message);
}

export async function sendTelegramReminderNotification(
  staff: Staff,
  appointmentData: {
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
  }
): Promise<boolean> {
  if (!staff.telegram_bot_token || !staff.telegram_chat_id) {
    console.log('Staff Telegram credentials not found');
    return false;
  }

  const message = `
⏰ <b>Напоминание о записи</b>

👤 Клиент: ${appointmentData.clientName}
💆‍♂️ Услуга: ${appointmentData.serviceName}
📅 Дата: ${appointmentData.date}
⏰ Время: ${appointmentData.time}

<i>Запись состоится через 1 час.</i>
`;

  return sendTelegramMessage(staff.telegram_bot_token, staff.telegram_chat_id, message);
}