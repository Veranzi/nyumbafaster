-- Keja: reviews. MVP is one-way (tenant → landlord/agent or → property).
-- v2 will add owner→tenant after a lease ends.
create type review_subject as enum ('landlord', 'agent', 'property');

create table public.reviews (
    id            uuid primary key default gen_random_uuid(),
    reviewer_id   uuid not null references public.profiles(id) on delete cascade,
    subject_kind  review_subject not null,
    subject_id    uuid not null,                              -- profile id or property id
    rating        int not null check (rating between 1 and 5),
    body          text check (length(body) <= 2000),
    -- A review must be tied to a real interaction (a completed viewing or a lease).
    -- Enforced in app code, not the DB, so we can grant exceptions during moderation.
    viewing_id    uuid references public.viewings(id) on delete set null,
    lease_id      uuid references public.leases(id) on delete set null,
    helpful_count int not null default 0,
    created_at    timestamptz not null default now(),
    -- one review per reviewer per subject
    unique (reviewer_id, subject_kind, subject_id)
);

create index reviews_subject_idx on public.reviews(subject_kind, subject_id, created_at desc);

-- Recompute the subject's rating cache when a review lands or is updated.
create or replace function public.recompute_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
    sid uuid := coalesce(new.subject_id, old.subject_id);
    skind review_subject := coalesce(new.subject_kind, old.subject_kind);
    avg_rating numeric(3,2);
    cnt int;
begin
    select avg(rating)::numeric(3,2), count(*)
      into avg_rating, cnt
      from public.reviews
     where subject_id = sid and subject_kind = skind;

    if skind in ('landlord', 'agent') then
        update public.profiles set rating_avg = avg_rating, rating_count = cnt where id = sid;
    end if;
    -- properties don't carry their own rating cache yet (v2)
    return null;
end;
$$;

create trigger reviews_recompute
    after insert or update or delete on public.reviews
    for each row execute function public.recompute_rating();
