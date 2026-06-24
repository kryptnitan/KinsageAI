-- Enable pgvector extension
create extension if not exists vector;

-- Create users table (synchronized with auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sync auth.users to public.users via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, new.created_at);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create families table
create table public.families (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.users(id) on delete cascade not null,
  family_name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create family_members table
create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  full_name text not null,
  relationship text not null,
  birth_date date,
  death_date date,
  biography text,
  avatar_url text
);

-- Create memories table
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  member_id uuid references public.family_members(id) on delete set null,
  title text not null,
  description text,
  content text,
  category text not null,
  memory_date date,
  media_url text,
  summary text,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create relationships table
create table public.relationships (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  source_member uuid references public.family_members(id) on delete cascade not null,
  target_member uuid references public.family_members(id) on delete cascade not null,
  relationship_type text not null
);

-- Create timeline_events table
create table public.timeline_events (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  title text not null,
  description text,
  event_date date not null,
  event_type text not null
);

-- Create conversations table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_families_owner on public.families(owner_id);
create index idx_members_family on public.family_members(family_id);
create index idx_memories_family on public.memories(family_id);
create index idx_memories_member on public.memories(member_id);
create index idx_relationships_family on public.relationships(family_id);
create index idx_relationships_source on public.relationships(source_member);
create index idx_relationships_target on public.relationships(target_member);
create index idx_timeline_events_family on public.timeline_events(family_id);
create index idx_timeline_events_date on public.timeline_events(event_date);
create index idx_conversations_family on public.conversations(family_id);
create index idx_messages_conversation on public.messages(conversation_id);

-- Disable Row Level Security (RLS) on all tables for public bypass access
alter table public.users disable row level security;
alter table public.families disable row level security;
alter table public.family_members disable row level security;
alter table public.memories disable row level security;
alter table public.relationships disable row level security;
alter table public.timeline_events disable row level security;
alter table public.conversations disable row level security;
alter table public.messages disable row level security;

-- RLS Policies

-- Users policies
create policy "Users can access their own profile"
  on public.users for all using (auth.uid() = id);

-- Families policies
create policy "Users can access their own families"
  on public.families for all using (auth.uid() = owner_id);

-- Family Members policies
create policy "Users can access family members of their families"
  on public.family_members for all using (
    exists (
      select 1 from public.families
      where families.id = family_members.family_id
      and families.owner_id = auth.uid()
    )
  );

-- Memories policies
create policy "Users can access memories of their families"
  on public.memories for all using (
    exists (
      select 1 from public.families
      where families.id = memories.family_id
      and families.owner_id = auth.uid()
    )
  );

-- Relationships policies
create policy "Users can access relationships of their families"
  on public.relationships for all using (
    exists (
      select 1 from public.families
      where families.id = relationships.family_id
      and families.owner_id = auth.uid()
    )
  );

-- Timeline Events policies
create policy "Users can access timeline events of their families"
  on public.timeline_events for all using (
    exists (
      select 1 from public.families
      where families.id = timeline_events.family_id
      and families.owner_id = auth.uid()
    )
  );

-- Conversations policies
create policy "Users can access conversations of their families"
  on public.conversations for all using (
    exists (
      select 1 from public.families
      where families.id = conversations.family_id
      and families.owner_id = auth.uid()
    )
  );

-- Messages policies
create policy "Users can access messages in their conversations"
  on public.messages for all using (
    exists (
      select 1 from public.conversations
      join public.families on families.id = conversations.family_id
      where conversations.id = messages.conversation_id
      and families.owner_id = auth.uid()
    )
  );

-- Similarity search function for memories using cosine similarity
create or replace function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_family_id uuid
)
returns table (
  id uuid,
  family_id uuid,
  member_id uuid,
  title text,
  description text,
  content text,
  category text,
  memory_date date,
  media_url text,
  summary text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.family_id,
    memories.member_id,
    memories.title,
    memories.description,
    memories.content,
    memories.category,
    memories.memory_date,
    memories.media_url,
    memories.summary,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where memories.family_id = p_family_id
    and memories.embedding is not null
    and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create Storage Buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('photos', 'photos', true),
  ('audio', 'audio', true),
  ('documents', 'documents', true)
on conflict (id) do nothing;

-- Storage Security Policies (allowed for public users in demo mode)
create policy "Public users can upload objects"
  on storage.objects for insert to public
  with check (bucket_id in ('avatars', 'photos', 'audio', 'documents'));

create policy "Public users can select objects"
  on storage.objects for select to public
  using (bucket_id in ('avatars', 'photos', 'audio', 'documents'));

create policy "Public users can delete objects"
  on storage.objects for delete to public
  using (bucket_id in ('avatars', 'photos', 'audio', 'documents'));
