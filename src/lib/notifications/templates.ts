import { TEMPLATE_VARIABLES, SMS_PROSTO_VARIABLES } from './config';
import type { NotificationData } from './types';

/**
 * Convert template variables to SMS-Prosto format
 */
export function convertTemplateToSMSProstoFormat(template: string): string {
  return template
    .replace(TEMPLATE_VARIABLES.CLIENT_NAME, SMS_PROSTO_VARIABLES.WORD)
    .replace(TEMPLATE_VARIABLES.SERVICE_NAME, SMS_PROSTO_VARIABLES.WORD)
    .replace(TEMPLATE_VARIABLES.STAFF_NAME, SMS_PROSTO_VARIABLES.WORD)
    .replace(TEMPLATE_VARIABLES.APPOINTMENT_TIME, SMS_PROSTO_VARIABLES.NUMBER)
    .replace(TEMPLATE_VARIABLES.LOCATION, SMS_PROSTO_VARIABLES.WORD)
    .replace(TEMPLATE_VARIABLES.REVIEW_LINK, SMS_PROSTO_VARIABLES.WORD)
    .replace(TEMPLATE_VARIABLES.BOOKING_LINK, SMS_PROSTO_VARIABLES.WORD);
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  data: NotificationData
): string {
  const variables = [
    data.client_name,
    data.service_name,
    data.staff_name,
    data.appointment_time,
    data.location,
    data.review_link,
    data.booking_link,
  ];

  return template.replace(
    new RegExp(`${SMS_PROSTO_VARIABLES.WORD}|${SMS_PROSTO_VARIABLES.NUMBER}`, 'g'),
    () => variables.shift() || ''
  );
}

/**
 * Validate template according to SMS-Prosto rules
 */
export function validateTemplate(template: string): boolean {
  // Check for mixed alphabets in words
  const hasMixedAlphabets = /[а-яё][a-z]|[a-z][а-яё]/i.test(template);
  if (hasMixedAlphabets) {
    return false;
  }

  // Check for valid variable usage
  const validVariablePattern = new RegExp(
    `${SMS_PROSTO_VARIABLES.WORD}|${SMS_PROSTO_VARIABLES.NUMBER}|` +
    `${SMS_PROSTO_VARIABLES.WORD_SEQUENCE}|${SMS_PROSTO_VARIABLES.NUMBER_SEQUENCE}|` +
    `${SMS_PROSTO_VARIABLES.NUMBER_SERIES}`
  );

  const variables = template.match(/%[wd](\{1,\d\})?(\+)?/g) || [];
  return variables.every(variable => validVariablePattern.test(variable));
}