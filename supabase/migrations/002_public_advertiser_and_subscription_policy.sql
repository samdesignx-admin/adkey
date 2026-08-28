-- Adkey follow-up security policies
-- Run this once after 001_initial_schema.sql.

create policy "public reads advertiser profile"
on public.advertisers
for select
using (true);

create policy "owners manage subscriptions"
on public.subscriptions
for all
using (
  exists (
    select 1 from public.advertisers a
    where a.id = subscriptions.advertiser_id
      and a.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.advertisers a
    where a.id = subscriptions.advertiser_id
      and a.owner_user_id = auth.uid()
  )
);
