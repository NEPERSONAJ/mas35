import type { Staff } from '../types';

export interface SMSProstoResponse {
  response: {
    msg: {
      err_code: string;
      text: string;
      type: string;
    };
    data: {
      id: string;
      credits: string;
      n_raw_sms: number;
      sender_name: string;
      status?: string;
    } | null;
  };
}

export interface SMSProstoProfileResponse {
  response: {
    msg: {
      err_code: string;
      text: string;
      type: string;
    };
    data: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      credits: string;
      credits_used: string;
      credits_name: string;
      currency: string;
      sender_name: string;
      referral_id: string;
    } | null;
  };
}

export interface NotificationData {
  client_name: string;
  service_name: string;
  staff_name: string;
  appointment_time: string;
  location: string;
  review_link?: string;
  booking_link?: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  message_template: string;
  route?: string;
}

export interface NotificationQueueItem {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  scheduled_time: string;
  notification_templates: NotificationTemplate;
  appointments: {
    clients: {
      name: string;
      phone: string;
    };
    services: {
      name: string;
    };
    staff: Staff;
    start_time: string;
  };
}

export type NotificationType = 
  | 'appointment_created'
  | 'appointment_reminder'
  | 'post_appointment'
  | 'return_reminder';