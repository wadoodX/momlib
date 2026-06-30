-- Resource categories + paid (Payhip) capability.
-- Additive: new columns are nullable / default-safe so existing rows stay valid.
-- `category` is a manual taxonomy (drives the admin/student card chip) and is
-- independent of the auto-detected `resource_type` (which still drives previews).

alter table public.resources
  add column if not exists category text,
  add column if not exists is_paid boolean not null default false,
  add column if not exists payhip_url text;

alter table public.resources
  add constraint resources_category_check
  check (
    category is null
    or category in (
      'notes','slides','quiz','question_bank',
      'worksheet','audio','link','document','other'
    )
  );

-- Relax the original "must have a file or a link" check to also accept a
-- Payhip-only product. Drop the auto-named table check, then re-add a named one.
alter table public.resources drop constraint if exists resources_check;
alter table public.resources
  add constraint resources_location_check
  check (
    file_path is not null
    or external_url is not null
    or payhip_url is not null
  );

-- A paid resource must carry a Payhip buy URL (the locking UI relies on it).
alter table public.resources
  add constraint resources_paid_requires_payhip
  check (is_paid = false or payhip_url is not null);
