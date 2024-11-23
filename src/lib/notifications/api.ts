import { supabase } from '../supabase';
import { SMS_PROSTO_CONFIG, getSMSSettings } from './config';
import { SMSProstoError } from './errors';
import type { SMSProstoResponse, SMSProstoProfileResponse } from './types';

/**
 * Send request to SMS-Prosto API
 */
async function sendSMSProstoRequest<T>(
  method: string,
  params: Record<string, string>
): Promise<T> {
  const settings = await getSMSSettings();
  
  if (!settings.API_KEY) {
    throw new SMSProstoError('API key is not configured', '401');
  }

  const searchParams = new URLSearchParams({
    method,
    key: settings.API_KEY,
    format: 'json',
    ...params,
  });

  if (settings.TEST_MODE) {
    console.log('TEST MODE - Request params:', Object.fromEntries(searchParams));
    return {
      response: {
        msg: { err_code: '0', text: 'Test mode success', type: 'success' },
        data: {
          id: '0',
          credits: '100.00',
          credits_used: '0.00',
          credits_name: 'TEST',
          currency: 'RUB',
          sender_name: settings.SENDER_NAME,
          n_raw_sms: 1,
          status: 'delivered'
        }
      }
    } as T;
  }

  try {
    const response = await fetch(`${SMS_PROSTO_CONFIG.API_URL}/?${searchParams}`);
    if (!response.ok) {
      throw new SMSProstoError(
        'Failed to communicate with SMS-Prosto API',
        response.status.toString()
      );
    }

    const data = await response.json();

    if (data.response.msg.err_code !== '0') {
      throw new SMSProstoError(
        data.response.msg.text || 'Unknown SMS-Prosto error',
        data.response.msg.err_code,
        data.response.data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SMSProstoError) {
      throw error;
    }
    throw new SMSProstoError(
      'Failed to communicate with SMS-Prosto API',
      '699',
      error
    );
  }
}

/**
 * Check account balance
 */
export async function checkBalance(): Promise<number> {
  try {
    const data = await sendSMSProstoRequest<SMSProstoProfileResponse>('get_profile', {});
    return parseFloat(data.response.data?.credits || '0');
  } catch (error) {
    if (error instanceof SMSProstoError) {
      throw new Error(`SMS-Prosto error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Send message using SMS-Prosto
 */
export async function sendMessage(
  phone: string,
  message: string,
  priority?: number,
  route?: string
): Promise<boolean> {
  const settings = await getSMSSettings();

  const params = {
    text: message,
    phone: phone.replace(/\D/g, ''), // Remove non-digits
    sender_name: settings.SENDER_NAME,
    priority: (priority || settings.DEFAULT_PRIORITY).toString(),
    route: route || settings.DEFAULT_ROUTE,
  };

  try {
    const data = await sendSMSProstoRequest<SMSProstoResponse>('push_msg', params);
    return data.response.msg.err_code === '0';
  } catch (error) {
    if (error instanceof SMSProstoError) {
      throw new Error(`SMS-Prosto error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get message status
 */
export async function getMessageStatus(messageId: string): Promise<string> {
  try {
    const data = await sendSMSProstoRequest<SMSProstoResponse>('get_status', {
      id: messageId,
    });
    return data.response.data?.status || 'unknown';
  } catch (error) {
    if (error instanceof SMSProstoError) {
      throw new Error(`SMS-Prosto error: ${error.message}`);
    }
    throw error;
  }
}
