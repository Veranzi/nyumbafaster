-- Keja: in-app chat between tenant and listing owner
-- One conversation per (property, tenant) pair so we never duplicate threads.
create table public.conversations (
    id              uuid primary key default gen_random_uuid(),
    property_id     uuid not null references public.properties(id) on delete cascade,
    tenant_id       uuid not null references public.profiles(id) on delete cascade,
    owner_id        uuid not null references public.profiles(id) on delete cascade,
    last_message_at timestamptz,
    tenant_unread   int not null default 0,
    owner_unread    int not null default 0,
    created_at      timestamptz not null default now(),
    unique (property_id, tenant_id)
);

create index conversations_tenant_idx on public.conversations(tenant_id, last_message_at desc nulls last);
create index conversations_owner_idx  on public.conversations(owner_id,  last_message_at desc nulls last);

create table public.messages (
    id              uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    sender_id       uuid not null references public.profiles(id) on delete cascade,
    body            text not null check (length(body) between 1 and 4000),
    attachments     jsonb not null default '[]'::jsonb,
    read_at         timestamptz,
    created_at      timestamptz not null default now()
);

create index messages_conv_idx on public.messages(conversation_id, created_at desc);

-- Bump conversation.last_message_at + unread counts on insert.
create or replace function public.bump_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
    convo public.conversations;
begin
    select * into convo from public.conversations where id = new.conversation_id;
    update public.conversations
        set last_message_at = new.created_at,
            tenant_unread = case when new.sender_id = convo.owner_id  then tenant_unread + 1 else tenant_unread end,
            owner_unread  = case when new.sender_id = convo.tenant_id then owner_unread  + 1 else owner_unread  end
        where id = new.conversation_id;
    return new;
end;
$$;

create trigger messages_bump_conversation
    after insert on public.messages
    for each row execute function public.bump_conversation();
