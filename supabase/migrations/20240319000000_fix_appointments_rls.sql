-- Drop existing RLS policies for appointments
drop policy if exists "Appointments viewable by authenticated users" on appointments;
drop policy if exists "Appointments insertable by everyone" on appointments;
drop policy if exists "Appointments updatable by authenticated users" on appointments;

-- Create new RLS policies for appointments
create policy "Appointments are viewable by everyone"
  on appointments for select
  using (true);

create policy "Appointments are insertable by everyone"
  on appointments for insert
  with check (true);

create policy "Appointments are updatable by authenticated users or appointment owner"
  on appointments for update
  using (
    auth.role() = 'authenticated' or
    client_id = (
      select id from clients 
      where phone = current_setting('request.jwt.claims')::json->>'phone'
    )
  );