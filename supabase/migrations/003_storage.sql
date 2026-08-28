-- Adkey media storage setup
-- Safe to run once. Creates private buckets and RLS policies.

insert into storage.buckets (id, name, public)
values ('ad-media', 'ad-media', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', false)
on conflict (id) do nothing;

-- Users may upload into folders that begin with their auth user id.
create policy "users upload own ad media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'ad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users read own ad media"
on storage.objects for select to authenticated
using (
  bucket_id = 'ad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update own ad media"
on storage.objects for update to authenticated
using (
  bucket_id = 'ad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'ad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete own ad media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'ad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users upload own business assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users read own business assets"
on storage.objects for select to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update own business assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete own business assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);