-- Keja: RPCs for things PostgREST can't do natively (geography, atomic
-- multi-table operations).

-- Set a property's location after insert. Owner-only.
create or replace function public.set_property_location(p_id uuid, p_lng float8, p_lat float8)
returns void
language plpgsql
security invoker  -- runs as the caller; RLS still applies
as $$
begin
    update public.properties
        set location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        where id = p_id and owner_id = auth.uid();
end;
$$;

-- Atomic viewing booking: creates the viewing row + a pending payment row.
-- Returns both ids so the caller can fire STK push and link by request id.
create or replace function public.create_viewing_with_payment(
    p_property_id uuid,
    p_scheduled_for timestamptz,
    p_msisdn text,
    p_note text
)
returns table(viewing_id uuid, payment_id uuid, viewing_fee_kes int, owner_id uuid)
language plpgsql
security invoker
as $$
declare
    prop record;
    v_id uuid;
    pay_id uuid;
begin
    select id, owner_id, viewing_fee_kes, status
        into prop
        from public.properties
        where id = p_property_id;

    if prop.id is null or prop.status <> 'active' then
        raise exception 'Property not bookable';
    end if;
    if prop.owner_id = auth.uid() then
        raise exception 'You cannot book your own listing';
    end if;

    insert into public.viewings (property_id, tenant_id, owner_id, scheduled_for, viewing_fee_kes, tenant_note,
                                 escrow_status, status)
        values (prop.id, auth.uid(), prop.owner_id, p_scheduled_for, prop.viewing_fee_kes, p_note,
                case when prop.viewing_fee_kes > 0 then 'held' else 'none' end,
                'requested')
        returning id into v_id;

    if prop.viewing_fee_kes > 0 then
        insert into public.payments (user_id, counterparty_id, kind, amount_kes,
                                     msisdn, status, related_viewing_id)
            values (auth.uid(), prop.owner_id, 'viewing_fee', prop.viewing_fee_kes,
                    p_msisdn, 'pending', v_id)
            returning id into pay_id;
    end if;

    return query select v_id, pay_id, prop.viewing_fee_kes, prop.owner_id;
end;
$$;
