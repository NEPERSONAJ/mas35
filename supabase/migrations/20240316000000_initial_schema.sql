-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type notification_type as enum ('appointment_created', 'appointment_reminder', 'post_appointment', 'return_reminder');
create type message_status as enum ('pending', 'sent', 'failed');

-- Services table
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  duration interval not null,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Staff table
create table staff (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  specialty text not null,
  bio text,
  image_url text,
  phone text,
  email text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Staff services junction table
create table staff_services (
  staff_id uuid references staff(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- Clients table
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null unique,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments table
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) not null,
  service_id uuid references services(id) not null,
  staff_id uuid references staff(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status appointment_status default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notification templates table
create table notification_templates (
  id uuid primary key default uuid_generate_v4(),
  type notification_type not null,
  message_template text not null,
  delay_hours int, -- For post-appointment and return reminders
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notification queue table
create table notification_queue (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references appointments(id) on delete cascade,
  template_id uuid references notification_templates(id),
  scheduled_time timestamp with time zone not null,
  status message_status default 'pending',
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table services enable row level security;
alter table staff enable row level security;
alter table staff_services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table notification_templates enable row level security;
alter table notification_queue enable row level security;

-- Create policies
create policy "Public services are viewable by everyone" on services
  for select using (true);

create policy "Services are insertable by authenticated users only" on services
  for insert with check (auth.role() = 'authenticated');

create policy "Services are updatable by authenticated users only" on services
  for update using (auth.role() = 'authenticated');

-- Similar policies for other tables
create policy "Staff viewable by everyone" on staff
  for select using (true);

create policy "Staff manageable by authenticated users" on staff
  for all using (auth.role() = 'authenticated');

create policy "Appointments viewable by authenticated users" on appointments
  for select using (auth.role() = 'authenticated');

create policy "Appointments insertable by everyone" on appointments
  for insert with check (true);

create policy "Appointments updatable by authenticated users" on appointments
  for update using (auth.role() = 'authenticated');

-- Create functions and triggers
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all tables
create trigger set_updated_at_services
  before update on services
  for each row execute function set_updated_at();

create trigger set_updated_at_staff
  before update on staff
  for each row execute function set_updated_at();

create trigger set_updated_at_clients
  before update on clients
  for each row execute function set_updated_at();

create trigger set_updated_at_appointments
  before update on appointments
  for each row execute function set_updated_at();

-- Function to schedule notifications for an appointment
create or replace function schedule_appointment_notifications()
returns trigger as $$
declare
  template_record record;
begin
  -- Schedule appointment creation notification
  insert into notification_queue (
    appointment_id,
    template_id,
    scheduled_time
  )
  select
    new.id,
    t.id,
    new.created_at
  from notification_templates t
  where t.type = 'appointment_created' and t.is_active;

  -- Schedule appointment reminder (1 hour before)
  insert into notification_queue (
    appointment_id,
    template_id,
    scheduled_time
  )
  select
    new.id,
    t.id,
    new.start_time - interval '1 hour'
  from notification_templates t
  where t.type = 'appointment_reminder' and t.is_active;

  -- Schedule post-appointment notification
  insert into notification_queue (
    appointment_id,
    template_id,
    scheduled_time
  )
  select
    new.id,
    t.id,
    new.end_time + (t.delay_hours || ' hours')::interval
  from notification_templates t
  where t.type = 'post_appointment' and t.is_active;

  -- Schedule return reminder
  insert into notification_queue (
    appointment_id,
    template_id,
    scheduled_time
  )
  select
    new.id,
    t.id,
    new.end_time + (t.delay_hours || ' hours')::interval
  from notification_templates t
  where t.type = 'return_reminder' and t.is_active;

  return new;
end;
$$ language plpgsql;

-- Add trigger for scheduling notifications
create trigger schedule_notifications_trigger
  after insert on appointments
  for each row execute function schedule_appointment_notifications();

-- Insert default notification templates
insert into notification_templates (type, message_template, delay_hours) values
  ('appointment_created', 'Здравствуйте, {client_name}! Подтверждаем вашу запись на {service_name} к специалисту {staff_name} на {appointment_time}. Ждём вас по адресу: {location}', null),
  ('appointment_reminder', 'Здравствуйте, {client_name}! Напоминаем о записи на {service_name} через 1 час. Ждём вас в {appointment_time} по адресу: {location}', null),
  ('post_appointment', 'Здравствуйте, {client_name}! Спасибо, что выбрали нас! Пожалуйста, оставьте отзыв о процедуре {service_name}: {review_link}', 2),
  ('return_reminder', 'Здравствуйте, {client_name}! Рекомендуем повторить процедуру {service_name}. Запишитесь онлайн: {booking_link}', 1440); -- 60 дней