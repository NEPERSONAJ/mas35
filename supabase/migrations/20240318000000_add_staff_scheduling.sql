-- Create enums
create type availability_pattern as enum ('weekly', 'specific_dates', 'recurring_day');
create type weekday as enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Staff working hours
create table staff_working_hours (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) on delete cascade,
  pattern availability_pattern not null,
  -- For weekly pattern
  weekday weekday,
  -- For specific dates
  start_date date,
  end_date date,
  -- For recurring day (e.g., every first Monday)
  day_of_week weekday,
  week_of_month int check (week_of_month between 1 and 5),
  -- Common fields
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Constraints
  constraint valid_time_range check (start_time < end_time),
  constraint valid_pattern_fields check (
    (pattern = 'weekly' and weekday is not null and start_date is null and end_date is null and day_of_week is null and week_of_month is null) or
    (pattern = 'specific_dates' and weekday is null and start_date is not null and end_date is not null and day_of_week is null and week_of_month is null) or
    (pattern = 'recurring_day' and weekday is null and start_date is null and end_date is null and day_of_week is not null and week_of_month is not null)
  )
);

-- Staff breaks
create table staff_breaks (
  id uuid primary key default uuid_generate_v4(),
  working_hours_id uuid references staff_working_hours(id) on delete cascade,
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_break_time check (start_time < end_time)
);

-- Staff time off
create table staff_time_off (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_date_range check (start_date <= end_date)
);

-- Add RLS policies
alter table staff_working_hours enable row level security;
alter table staff_breaks enable row level security;
alter table staff_time_off enable row level security;

-- Policies for staff_working_hours
create policy "Staff working hours viewable by everyone"
  on staff_working_hours for select
  using (true);

create policy "Staff working hours manageable by authenticated users"
  on staff_working_hours for all
  using (auth.role() = 'authenticated');

-- Policies for staff_breaks
create policy "Staff breaks viewable by everyone"
  on staff_breaks for select
  using (true);

create policy "Staff breaks manageable by authenticated users"
  on staff_breaks for all
  using (auth.role() = 'authenticated');

-- Policies for staff_time_off
create policy "Staff time off viewable by everyone"
  on staff_time_off for select
  using (true);

create policy "Staff time off manageable by authenticated users"
  on staff_time_off for all
  using (auth.role() = 'authenticated');

-- Add updated_at triggers
create trigger set_updated_at_staff_working_hours
  before update on staff_working_hours
  for each row execute function set_updated_at();

create trigger set_updated_at_staff_breaks
  before update on staff_breaks
  for each row execute function set_updated_at();

create trigger set_updated_at_staff_time_off
  before update on staff_time_off
  for each row execute function set_updated_at();

-- Helper function to convert date to weekday enum
create or replace function get_weekday(p_date date)
returns weekday as $$
begin
  return lower(trim(to_char(p_date, 'day')))::weekday;
end;
$$ language plpgsql;

-- Function to check staff availability
create or replace function check_staff_availability(
  p_staff_id uuid,
  p_date date,
  p_start_time time,
  p_end_time time
)
returns boolean as $$
declare
  v_weekday weekday;
  v_week_of_month int;
  v_is_available boolean;
  v_has_working_hours boolean;
begin
  -- Get weekday and week of month for the given date
  v_weekday := get_weekday(p_date);
  v_week_of_month := ceil(extract(day from p_date) / 7.0)::int;

  -- Check if staff is on time off
  if exists (
    select 1 from staff_time_off
    where staff_id = p_staff_id
    and p_date between start_date and end_date
  ) then
    return false;
  end if;

  -- Check working hours
  v_has_working_hours := false;
  v_is_available := exists (
    select 1 from staff_working_hours wh
    where staff_id = p_staff_id
    and is_active = true
    and (
      -- Weekly pattern
      (pattern = 'weekly' and weekday = v_weekday) or
      -- Specific dates
      (pattern = 'specific_dates' and p_date between start_date and end_date) or
      -- Recurring day
      (pattern = 'recurring_day' and day_of_week = v_weekday and week_of_month = v_week_of_month)
    )
    and p_start_time >= wh.start_time
    and p_end_time <= wh.end_time
    -- Check if there are no breaks during the requested time
    and not exists (
      select 1 from staff_breaks b
      where b.working_hours_id = wh.id
      and (
        (b.start_time, b.end_time) overlaps (p_start_time, p_end_time)
      )
    )
  );

  -- Check if there are any working hours defined for this staff
  select exists (
    select 1 from staff_working_hours
    where staff_id = p_staff_id
    and is_active = true
  ) into v_has_working_hours;

  -- If no working hours are defined, consider staff as unavailable
  if not v_has_working_hours then
    return false;
  end if;

  return v_is_available;
end;
$$ language plpgsql;

-- Function to get available time slots for staff
create or replace function get_staff_available_slots(
  p_staff_id uuid,
  p_date date,
  p_duration interval
)
returns table (
  start_time timestamp with time zone,
  end_time timestamp with time zone
) as $$
declare
  v_weekday weekday;
  v_week_of_month int;
  v_slot_start time;
  v_slot_end time;
  v_working_hours record;
begin
  -- Get weekday and week of month for the given date
  v_weekday := get_weekday(p_date);
  v_week_of_month := ceil(extract(day from p_date) / 7.0)::int;

  -- Check if staff is on time off
  if exists (
    select 1 from staff_time_off
    where staff_id = p_staff_id
    and p_date between start_date and end_date
  ) then
    return;
  end if;

  -- Get working hours for the day
  for v_working_hours in (
    select wh.start_time, wh.end_time, wh.id as working_hours_id
    from staff_working_hours wh
    where wh.staff_id = p_staff_id
    and wh.is_active = true
    and (
      (wh.pattern = 'weekly' and wh.weekday = v_weekday) or
      (wh.pattern = 'specific_dates' and p_date between wh.start_date and wh.end_date) or
      (wh.pattern = 'recurring_day' and wh.day_of_week = v_weekday and wh.week_of_month = v_week_of_month)
    )
  ) loop
    -- Initialize slot start time
    v_slot_start := v_working_hours.start_time;

    -- Generate slots until end of working hours
    while v_slot_start + p_duration <= v_working_hours.end_time loop
      v_slot_end := v_slot_start + p_duration;

      -- Check if slot overlaps with any breaks
      if not exists (
        select 1 from staff_breaks b
        where b.working_hours_id = v_working_hours.working_hours_id
        and (b.start_time, b.end_time) overlaps (v_slot_start, v_slot_end)
      ) then
        -- Check if slot overlaps with any appointments
        if not exists (
          select 1 from appointments a
          where a.staff_id = p_staff_id
          and a.status != 'cancelled'
          and (
            p_date + v_slot_start,
            p_date + v_slot_end
          ) overlaps (a.start_time, a.end_time)
        ) then
          -- Return available slot
          return query
          select
            (p_date + v_slot_start)::timestamp with time zone,
            (p_date + v_slot_end)::timestamp with time zone;
        end if;
      end if;

      -- Move to next slot (30-minute intervals)
      v_slot_start := v_slot_start + interval '30 minutes';
    end loop;
  end loop;
end;
$$ language plpgsql;