-- Drop existing function
DROP FUNCTION IF EXISTS get_staff_available_slots;

-- Create improved function for getting available slots
CREATE OR REPLACE FUNCTION get_staff_available_slots(
  p_staff_id uuid,
  p_date date,
  p_duration interval
)
RETURNS TABLE (
  start_time timestamp with time zone,
  end_time timestamp with time zone
) AS $$
DECLARE
  v_weekday weekday;
  v_week_of_month int;
  v_slot_start time;
  v_slot_end time;
  v_working_hours record;
  v_interval interval := '1 hour'::interval; -- Changed from 30 minutes to 1 hour
BEGIN
  -- Get weekday and week of month for the given date
  v_weekday := get_weekday(p_date);
  v_week_of_month := ceil(extract(day from p_date) / 7.0)::int;

  -- Check if staff is on time off
  IF EXISTS (
    SELECT 1 FROM staff_time_off
    WHERE staff_id = p_staff_id
    AND p_date BETWEEN start_date AND end_date
  ) THEN
    RETURN;
  END IF;

  -- Get working hours for the day
  FOR v_working_hours IN (
    SELECT wh.start_time, wh.end_time, wh.id as working_hours_id
    FROM staff_working_hours wh
    WHERE wh.staff_id = p_staff_id
    AND wh.is_active = true
    AND (
      (wh.pattern = 'weekly' AND wh.weekday = v_weekday) OR
      (wh.pattern = 'specific_dates' AND p_date BETWEEN wh.start_date AND wh.end_date) OR
      (wh.pattern = 'recurring_day' AND wh.day_of_week = v_weekday AND wh.week_of_month = v_week_of_month)
    )
  ) LOOP
    -- Initialize slot start time with working hours start time
    v_slot_start := v_working_hours.start_time;

    -- Generate slots until end of working hours
    WHILE v_slot_start + p_duration <= v_working_hours.end_time LOOP
      v_slot_end := v_slot_start + p_duration;

      -- Check if slot overlaps with any breaks
      IF NOT EXISTS (
        SELECT 1 FROM staff_breaks b
        WHERE b.working_hours_id = v_working_hours.working_hours_id
        AND (b.start_time, b.end_time) OVERLAPS (v_slot_start, v_slot_end)
      ) THEN
        -- Check if slot overlaps with any appointments
        IF NOT EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.staff_id = p_staff_id
          AND a.status != 'cancelled'
          AND (
            p_date + v_slot_start,
            p_date + v_slot_end
          ) OVERLAPS (a.start_time, a.end_time)
        ) THEN
          -- Return available slot
          RETURN QUERY
          SELECT
            (p_date + v_slot_start)::timestamp with time zone,
            (p_date + v_slot_end)::timestamp with time zone;
        END IF;
      END IF;

      -- Move to next slot (1 hour intervals)
      v_slot_start := v_slot_start + v_interval;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;