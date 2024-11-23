import { supabase } from './supabase';

interface NotificationData {
  client_name: string;
  service_name: string;
  staff_name: string;
  appointment_time: string;
  location: string;
  review_link?: string;
  booking_link?: string;
}

interface SMSProstoResponse {
  response: {
    msg: {
      err_code: string;
      text: string;
      type: string;
    };
    data: {
      id: number;
      credits: number;
      n_raw_sms: number;
      sender_name: string;
    } | null;
  };
}

const SMS_PROSTO_API_URL = 'https://ssl.bs00.ru';
const API_KEY = process.env.SMS_PROSTO_API_KEY;

export const checkBalance = async (): Promise<number> => {
  try {
    const response = await fetch(`${SMS_PROSTO_API_URL}/?method=get_profile&key=${API_KEY}&format=json`);
    const data = await response.json();
    
    if (data.response.msg.err_code === '0') {
      return parseFloat(data.response.data.credits);
    }
    
    throw new Error(data.response.msg.text);
  } catch (error) {
    console.error('Error checking balance:', error);
    throw error;
  }
};

export const sendMessage = async (phone: string, message: string, priority: number = 2): Promise<boolean> => {
  try {
    // First try WhatsApp with SMS fallback using cascade routing
    const response = await fetch(`${SMS_PROSTO_API_URL}/?method=push_msg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        key: API_KEY,
        text: message,
        phone: phone.replace(/\D/g, ''), // Remove non-digits
        sender_name: 'InTonus',
        priority: priority.toString(),
        route: 'wp-sms', // WhatsApp with SMS fallback
        format: 'json'
      })
    });

    const data: SMSProstoResponse = await response.json();
    return data.response.msg.err_code === '0';
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

export const processNotificationQueue = async () => {
  const now = new Date().toISOString();

  const { data: notifications, error } = await supabase
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
          name
        ),
        start_time
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_time', now)
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return;
  }

  // Check balance before processing
  try {
    const balance = await checkBalance();
    if (balance <= 0) {
      console.error('Insufficient balance for sending messages');
      return;
    }
  } catch (error) {
    console.error('Error checking balance:', error);
    return;
  }

  for (const notification of notifications) {
    const appointment = notification.appointments;
    const template = notification.notification_templates;
    const client = appointment.clients;

    const data: NotificationData = {
      client_name: client.name,
      service_name: appointment.services.name,
      staff_name: appointment.staff.name,
      appointment_time: new Date(appointment.start_time).toLocaleString('ru-RU'),
      location: 'ул. Гагарина, 61',
      review_link: 'https://intonus.ru/reviews',
      booking_link: 'https://intonus.ru/booking'
    };

    // Convert template variables to SMS-Prosto format
    let message = template.message_template
      .replace('{client_name}', '%w')
      .replace('{service_name}', '%w')
      .replace('{staff_name}', '%w')
      .replace('{appointment_time}', '%d')
      .replace('{location}', '%w');

    // Replace template variables with actual values
    message = message
      .replace('%w', data.client_name)
      .replace('%w', data.service_name)
      .replace('%w', data.staff_name)
      .replace('%d', data.appointment_time)
      .replace('%w', data.location);

    // Set priority based on notification type
    let priority = 2;
    if (template.type === 'appointment_reminder') {
      priority = 1; // Highest priority for reminders
    }

    const success = await sendMessage(client.phone, message, priority);

    await supabase
      .from('notification_queue')
      .update({
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
        error_message: success ? null : 'Failed to send notification'
      })
      .eq('id', notification.id);
  }
};

// Start processing queue every minute
setInterval(processNotificationQueue, 60000);