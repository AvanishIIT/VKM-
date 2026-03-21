create extension if not exists pgcrypto;

create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null,
  logo_image text default '',
  shop_tagline text default '',
  hero_title text default '',
  hero_description text default '',
  about_title text default '',
  about_description text default '',
  hero_side_note text default '',
  top_notice text default '',
  phones jsonb not null default '[]'::jsonb,
  whatsapp_number text default '',
  address text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  image_url text default '',
  display_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tag text default '',
  name text not null,
  description text default '',
  price text default '',
  image_url text default '',
  display_order integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.shop_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "public read shop_settings" on public.shop_settings;
create policy "public read shop_settings" on public.shop_settings for select using (true);
drop policy if exists "auth manage shop_settings" on public.shop_settings;
create policy "auth manage shop_settings" on public.shop_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "auth manage categories" on public.categories;
create policy "auth manage categories" on public.categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "auth manage products" on public.products;
create policy "auth manage products" on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into public.shop_settings (
  shop_name, logo_image, shop_tagline, hero_title, hero_description,
  about_title, about_description, hero_side_note, top_notice,
  phones, whatsapp_number, address
)
select
  'VKM Tools & Agri Mart', '', 'Mechanical tools and agri machinery shop',
  'Powering your workshop, farm, and business.',
  'VKM is your one-stop shop for mechanical tools, agricultural machinery, spare parts, pumps, and workshop essentials.',
  'Built for Working Customers',
  'VKM serves farmers, workshops, small industries, mechanics, and field workers who need durable tools and machinery.',
  'Seller updates are stored online and shown to buyers automatically.',
  'Trusted machinery, tools, and farm equipment for local customers.',
  '["+91 9442140823","+91 9842742606","+91 9442150380"]'::jsonb,
  '+919442140823',
  'VKM TRADERS, ULAVARSANTHI, ATTUR, SALEM'
where not exists (select 1 from public.shop_settings);

insert into public.categories (title, description, image_url, display_order)
select * from (
  values
  ('Mechanical Tools', 'Drills, grinders, spanners, cutters, welding tools, and workshop equipment.', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80', 1),
  ('Agri Machinery', 'Brush cutters, sprayers, tillers, engines, and field-use machines.', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80', 2),
  ('Spare Parts', 'Belts, bearings, couplings, engine parts, and machine accessories.', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80', 3),
  ('Pumps and Motors', 'Water pumps, irrigation motors, fittings, and farm water systems.', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80', 4)
) as seed(title, description, image_url, display_order)
where not exists (select 1 from public.categories);

insert into public.products (tag, name, description, price, image_url, display_order)
select * from (
  values
  ('Best Seller', 'Heavy Duty Chainsaw', 'Reliable cutting machine for woodwork, orchard use, and field maintenance.', 'Rs. 12,999', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80', 1),
  ('Workshop', 'Industrial Drill Machine', 'Powerful drill for repair shops, fabrication work, and installation jobs.', 'Rs. 4,850', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80', 2),
  ('Farm Use', 'Power Sprayer Kit', 'High-pressure sprayer for crop care, field spraying, and maintenance work.', 'Rs. 8,400', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80', 3)
) as seed(tag, name, description, price, image_url, display_order)
where not exists (select 1 from public.products);

create or replace function public.seed_vkm_demo_data()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.categories;
  delete from public.products;
  delete from public.shop_settings;

  insert into public.shop_settings (
    shop_name, logo_image, shop_tagline, hero_title, hero_description,
    about_title, about_description, hero_side_note, top_notice,
    phones, whatsapp_number, address
  ) values (
    'VKM Tools & Agri Mart', '', 'Mechanical tools and agri machinery shop',
    'Powering your workshop, farm, and business.',
    'VKM is your one-stop shop for mechanical tools, agricultural machinery, spare parts, pumps, and workshop essentials.',
    'Built for Working Customers',
    'VKM serves farmers, workshops, small industries, mechanics, and field workers who need durable tools and machinery.',
    'Seller updates are stored online and shown to buyers automatically.',
    'Trusted machinery, tools, and farm equipment for local customers.',
    '["+91 9442140823","+91 9842742606","+91 9442150380"]'::jsonb,
    '+919442140823',
    'VKM TRADERS, ULAVARSANTHI, ATTUR, SALEM'
  );

  insert into public.categories (title, description, image_url, display_order) values
  ('Mechanical Tools', 'Drills, grinders, spanners, cutters, welding tools, and workshop equipment.', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80', 1),
  ('Agri Machinery', 'Brush cutters, sprayers, tillers, engines, and field-use machines.', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80', 2),
  ('Spare Parts', 'Belts, bearings, couplings, engine parts, and machine accessories.', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80', 3),
  ('Pumps and Motors', 'Water pumps, irrigation motors, fittings, and farm water systems.', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80', 4);

  insert into public.products (tag, name, description, price, image_url, display_order) values
  ('Best Seller', 'Heavy Duty Chainsaw', 'Reliable cutting machine for woodwork, orchard use, and field maintenance.', 'Rs. 12,999', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80', 1),
  ('Workshop', 'Industrial Drill Machine', 'Powerful drill for repair shops, fabrication work, and installation jobs.', 'Rs. 4,850', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80', 2),
  ('Farm Use', 'Power Sprayer Kit', 'High-pressure sprayer for crop care, field spraying, and maintenance work.', 'Rs. 8,400', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80', 3);
end;
$$;

grant execute on function public.seed_vkm_demo_data() to authenticated;

insert into storage.buckets (id, name, public)
values ('shop-media', 'shop-media', true)
on conflict (id) do nothing;

drop policy if exists "public read shop-media" on storage.objects;
create policy "public read shop-media" on storage.objects for select using (bucket_id = 'shop-media');
drop policy if exists "auth manage shop-media" on storage.objects;
create policy "auth manage shop-media" on storage.objects for all using (bucket_id = 'shop-media' and auth.role() = 'authenticated') with check (bucket_id = 'shop-media' and auth.role() = 'authenticated');
