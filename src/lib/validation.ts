import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const validatePhone = (phone: string): { isValid: boolean; formattedNumber?: string } => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, 'RU');
    if (!phoneNumber) {
      return { isValid: false };
    }
    return {
      isValid: phoneNumber.isValid(),
      formattedNumber: phoneNumber.format('E.164')
    };
  } catch (error) {
    return { isValid: false };
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};