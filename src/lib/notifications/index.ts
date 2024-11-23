export * from './api';
export * from './config';
export * from './errors';
export * from './queue';
export * from './templates';
export * from './types';

// Start the notification queue processor
import { startNotificationQueue } from './queue';
startNotificationQueue();