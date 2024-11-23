import { supabase } from '../supabase';
import { SMS_PROSTO_CONFIG } from './config';
import { sendTelegramMessage } from './telegram';
import { checkBalance, sendMessage } from './api';
import { convertTemplateToSMSProstoFormat, replaceTemplateVariables } from './templates';
import { InsufficientBalanceError, NotificationQueueError } from './errors';
import type { NotificationData, NotificationQueueItem } from './types';

async function fetchPendingNotifications(): Promise<NotificationQueueItem[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('notification_queue')
    .select(`
      id,
      status,
      scheduled_time,
      notification_templates (
        message_template,
        type
      ),
      appointments (
        clients (
          name,
          phone
        ),
        services (
          name
        ),
        staff (
          id,
          name,
          telegram_bot_token,
          telegram_chat_id
        ),
        start_time
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_time', now)
    .limit(SMS_PROSTO_CONFIG.BATCH_SIZE);

  if (error) {
    throw new NotificationQueueError('Failed to fetch pending notifications', error);
  }

  return data;
}

async function updateNotificationStatus(
  id: string,
  success: boolean,
  error?: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from('notification_queue')
    .update({
      status: success ? 'sent' : 'failed',
      sent_at: success ? new Date().toISOString() : null,
      error_message: error || null,
    })
    .eq('id', id);

  if (updateError) {
    throw new NotificationQueueError('Failed to update notification status', updateError);
  }
}

async function prepareNotificationData(
  notification: NotificationQueueItem
): NotificationData {
  const { appointments } = notification;
  
  return {
    client_name: appointments.clients.name,
    service_name: appointments.services.name,
    staff_name: appointments.staff.name,
    appointment_time: new Date(appointments.start_time).toLocaleString('ru-RU'),
    location: SMS_PROSTO_CONFIG.LOCATION,
    review_link: `${SMS_PROSTO_CONFIG.BASE_URL}/reviews`,
    booking_link: `${SMS_PROSTO_CONFIG.BASE_URL}/booking`,
  };
}

async function processNotification(notification: NotificationQueueItem): Promise<boolean> {
  try {
    const data = await prepareNotificationData(notification);
    const template = notification.notification_templates;
    const smsProstoTemplate = convertTemplateToSMSProstoFormat(template.message_template);
    const message = replaceTemplateVariables(smsProstoTemplate, data);
    const staff = notification.appointments.staff;

    // Set priority based on notification type
    const priority = template.type === 'appointment_reminder'
      ? SMS_PROSTO_CONFIG.HIGH_PRIORITY
      : SMS_PROSTO_CONFIG.DEFAULT_PRIORITY;

    // Send to Telegram if staff has Telegram credentials
    if (staff.telegram_bot_token && staff.telegram_chat_id) {
      if (template.type === 'appointment_created' || template.type === 'appointment_reminder') {
        await sendTelegramMessage(
          staff.telegram_bot_token,
          staff.telegram_chat_id,
          `🔔 <b>${template.type === 'appointment_created' ? 'Новая запись' : 'Напоминание о записи'}</b>

👤 Клиент: ${data.client_name}
💆‍♂️ Услуга: ${data.service_name}
👨‍⚕️ Специалист: ${data.staff_name}
⏰ Время: ${data.appointment_time}
📍 Адрес: ${data.location}`
        );
      }
    }

    // Send SMS/WhatsApp message
    return await sendMessage(
      notification.appointments.clients.phone,
      message,
      priority
    );
  } catch (error) {
    console.error('Error processing notification:', error);
    return false;
  }
}

export async function processNotificationQueue(): Promise<void> {
  try {
    // Check balance before processing
    const balance = await checkBalance();
    if (balance <= 0) {
      throw new InsufficientBalanceError(balance);
    }

    const notifications = await fetchPendingNotifications();

    for (const notification of notifications) {
      try {
        const success = await processNotification(notification);
        await updateNotificationStatus(notification.id, success);
      } catch (error) {
        console.error('Error processing notification:', error);
        await updateNotificationStatus(
          notification.id,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  } catch (error) {
    console.error('Error in notification queue processor:', error);
  }
}

// Start processing queue
export function startNotificationQueue(): void {
  setInterval(processNotificationQueue, SMS_PROSTO_CONFIG.QUEUE_CHECK_INTERVAL);
}