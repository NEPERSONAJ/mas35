export class SMSProstoError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SMSProstoError';
  }
}

export class InsufficientBalanceError extends Error {
  constructor(balance: number) {
    super(`Insufficient balance: ${balance}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class NotificationQueueError extends Error {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NotificationQueueError';
  }
}