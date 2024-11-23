import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjkotxzyyrzfdlztunlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa290eHp5eXJ6ZmRsenR1bmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NDcyNTQsImV4cCI6MjA0NzMyMzI1NH0.gXzbxYO634MoS91PCvcnXeb9aQ42uf4RAHcCSVs-cYs';

export const supabase = createClient(supabaseUrl, supabaseKey);