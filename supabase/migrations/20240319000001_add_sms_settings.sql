-- Create SMS settings table
create table sms_settings (
  id uuid primary key default uuid_generate_v4(),
  api_key text not null,
  sender_name text not null,
  default_route text not null,
  default_priority int not null,
  test_mode boolean default false,
  base_url text not null,
  location text not null,
  queue_check_interval int not null default 60000,
  batch_size int not null default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policy
alter table sms_settings enable row level security;

create policy "SMS settings are viewable by authenticated users"
  on sms_settings for select
  using (auth.role() = 'authenticated');

create policy "SMS settings are manageable by authenticated users"
  on sms_settings for all
  using (auth.role() = 'authenticated');

-- Add updated_at trigger
create trigger set_updated_at_sms_settings
  before update on sms_settings
  for each row execute function set_updated_at();

-- Insert default settings
insert into sms_settings (
  api_key,
  sender_name,
  default_route,
  default_priority,
  test_mode,
  base_url,
  location,
  queue_check_interval,
  batch_size
) values (
  '',
  'InTonus',
  'wp-sms',
  2,
  true,
  'https://intonus.ru',
  'ул. Гагарина, 61',
  60000,
  50
);