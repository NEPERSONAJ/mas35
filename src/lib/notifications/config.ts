import { supabase } from '../supabase';

export const SMS_PROSTO_CONFIG = {
  API_URL: 'https://ssl.bs00.ru',
  ROUTES: {
    WHATSAPP_SMS: 'wp-sms',
    WHATSAPP_TELEGRAM_SMS: 'wp-tg-sms',
    WHATSAPP_VK_SMS: 'wp-vk-sms',
    WHATSAPP_VIBER_SMS: 'wp-vb-sms',
    TELEGRAM_VK_WP_SMS: 'tg-vk-wp-sms',
    VK_WP_VB_SMS: 'vk-wp-vb-sms',
    TG_VK_WP_VB_SMS: 'tg-vk-wp-vb-sms',
    TELEGRAM: 'telegram', // Added Telegram-only route
  },
  HIGH_PRIORITY: 1,
  DEFAULT_PRIORITY: 2,
  LOW_PRIORITY: 3,
  MASS_PRIORITY: 4,
  BATCH_SIZE: 50,
  QUEUE_CHECK_INTERVAL: 60000,
  TELEGRAM_BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
} as const;

// Template variables mapping
export const TEMPLATE_VARIABLES = {
  CLIENT_NAME: '{client_name}',
  SERVICE_NAME: '{service_name}',
  STAFF_NAME: '{staff_name}',
  APPOINTMENT_TIME: '{appointment_time}',
  LOCATION: '{location}',
  REVIEW_LINK: '{review_link}',
  BOOKING_LINK: '{booking_link}',
} as const;

// SMS-Prosto specific variables
export const SMS_PROSTO_VARIABLES = {
  WORD: '%w',
  NUMBER: '%d',
  WORD_SEQUENCE: '%w{1,9}',
  NUMBER_SEQUENCE: '%d{1,9}',
  NUMBER_SERIES: '%d+'
} as const;

// Function to get SMS settings from Supabase
export async function getSMSSettings() {
  const { data, error } = await supabase
    .from('sms_settings')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching SMS settings:', error);
    throw error;
  }

  return {
    API_KEY: data.api_key,
    SENDER_NAME: data.sender_name,
    DEFAULT_ROUTE: data.default_route,
    DEFAULT_PRIORITY: data.default_priority,
    HIGH_PRIORITY: SMS_PROSTO_CONFIG.HIGH_PRIORITY,
    TEST_MODE: data.test_mode,
    LOCATION: data.location,
    BASE_URL: data.base_url,
    QUEUE_CHECK_INTERVAL: data.queue_check_interval,
    BATCH_SIZE: data.batch_size,
  };
}
