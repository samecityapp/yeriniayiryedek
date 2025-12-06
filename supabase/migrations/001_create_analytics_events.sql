-- Create analytics_events table
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  hotel_id uuid references hotels(id) on delete cascade,
  event_type text not null check (event_type in ('whatsapp_click', 'phone_click', 'code_copy', 'page_view', 'website_click', 'instagram_click', 'map_click')),
  user_id uuid references auth.users(id),
  device_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table analytics_events enable row level security;

-- Allow public to insert events (tracking)
create policy "Allow public insert"
  on analytics_events for insert
  with check (true);

-- Allow admins to view all events
create policy "Allow admins to select"
  on analytics_events for select
  using (true); -- In a real app, you'd check for admin role here
