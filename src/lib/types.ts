export interface Staff {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  serviceIds?: string[];
  staff_services?: Array<{
    service_id: string;
  }>;
  workingHours?: WorkingHours[];
  timeOff?: TimeOff[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  service?: Service;
  staff?: Staff;
}

export interface WorkingHours {
  id: string;
  staff_id: string;
  pattern: 'weekly' | 'specific_dates' | 'recurring_day';
  weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_date?: string;
  end_date?: string;
  day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  week_of_month?: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  breaks?: Break[];
}

export interface Break {
  id: string;
  working_hours_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface TimeOff {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  type: 'appointment_created' | 'appointment_reminder' | 'post_appointment' | 'return_reminder';
  message_template: string;
  delay_hours?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  appointment_id: string;
  template_id: string;
  scheduled_time: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  appointment?: Appointment;
  template?: NotificationTemplate;
}