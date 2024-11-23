-- Add Telegram-related columns to staff table
ALTER TABLE staff
ADD COLUMN telegram_bot_token text,
ADD COLUMN telegram_chat_id text;

-- Update existing rows with null values
UPDATE staff 
SET telegram_bot_token = null,
    telegram_chat_id = null
WHERE telegram_bot_token IS NULL;