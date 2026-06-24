-- Mock User and Family for default testing (UUID: 00000000-0000-0000-0000-000000000000)
-- Note: In practice, users will use the "Load Demo Data" action to link to their own user accounts.
insert into auth.users (id, email, raw_user_meta_data, created_at)
values ('00000000-0000-0000-0000-000000000000', 'demo@kinsage.ai', '{}', now())
on conflict (id) do nothing;

insert into public.users (id, email, created_at)
values ('00000000-0000-0000-0000-000000000000', 'demo@kinsage.ai', now())
on conflict (id) do nothing;

-- Seed Family
insert into public.families (id, owner_id, family_name, description, created_at)
values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'The Sterling Family Archive',
  'Preserving the legacy, wisdom, and memories of the Sterling family across three generations.',
  now()
)
on conflict (id) do nothing;

-- Seed Family Members
insert into public.family_members (id, family_id, full_name, relationship, birth_date, death_date, biography, avatar_url)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Arthur Sterling',
    'Grandfather',
    '1938-04-12',
    null,
    'Founder of Sterling Manufacturing. Immigrated to the United States in 1962. Believes in hard work, integrity, and family unity.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Eleanor Sterling',
    'Grandmother',
    '1941-09-18',
    null,
    'Retired schoolteacher and family historian. Keeps the family stories alive and preserves historical records.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'b1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Charles Sterling',
    'Father',
    '1968-07-22',
    null,
    'CEO of Sterling Manufacturing. Enthusiastic gardener and cook. Dedicated to expanding the family business with sustainable tech.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Sarah Sterling',
    'Mother',
    '1970-11-05',
    null,
    'Pediatrician at Mercy Hospital. Loves hiking, classical music, and organizing family gatherings.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'c1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Emily Sterling',
    'Daughter',
    '1998-02-14',
    null,
    'Software Engineer living in San Francisco. Loves coding, photography, and keeping track of family histories digitally.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'James Sterling',
    'Son',
    '2001-08-30',
    null,
    'College student majoring in Environmental Science. Passionate about outdoor sports, music, and conservation.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  )
on conflict (id) do nothing;

-- Seed Relationships
insert into public.relationships (family_id, source_member, target_member, relationship_type)
values
  -- Arthur & Eleanor Spouses
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Spouse'),
  -- Charles is child of Arthur & Eleanor
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Parent'),
  ('11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Parent'),
  -- Charles & Sarah Spouses
  ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'Spouse'),
  -- Emily is child of Charles & Sarah
  ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Parent'),
  ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Parent'),
  -- James is child of Charles & Sarah
  ('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'Parent'),
  ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Parent')
on conflict do nothing;

-- Seed Memories with random mock embeddings
insert into public.memories (id, family_id, member_id, title, description, content, category, memory_date, media_url, summary, embedding)
values
  (
    'd1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'The Founding of Sterling Manufacturing',
    'Arthur explains how he started the business from a small garage in Chicago.',
    'In the winter of 1975, with just $1,500 in savings and a handful of hand tools, I opened the first workshop of Sterling Manufacturing in a leased garage. It was freezing cold, and the roof leaked, but we had a fire in our bellies. I worked 14-hour days, machining precision components for local factories. The key to our survival was reputation. We never shipped a part that wasn''t perfect. Always treat your clients with respect and stand behind your quality.',
    'Business Knowledge',
    '1975-11-01',
    null,
    'Arthur shares the beginning of Sterling Manufacturing in 1975, emphasizing reputation and quality.',
    (select array_agg(random())::real[] from generate_series(1, 1536))::vector
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'Grandma Eleanor''s Famous Apple Pie Recipe',
    'The secret family recipe passed down through generations.',
    'Here is the secret to the perfect crust: use half butter and half shortening, and make sure the water is ice-cold. For the filling, mix Granny Smith and Honeycrisp apples. Mix 1 cup sugar, 2 tbsp flour, 1 tsp cinnamon, and a pinch of nutmeg. Bake at 425°F for 15 minutes, then reduce to 375°F for 45 minutes until golden. This recipe was taught to me by my mother, and it has brought our family together around the dining table for every Thanksgiving since 1980.',
    'Recipes',
    '1980-11-27',
    null,
    'Eleanor''s signature Apple Pie recipe and crust-making secrets, a family Thanksgiving tradition.',
    (select array_agg(random())::real[] from generate_series(1, 1536))::vector
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Charles and Sarah''s Wedding in Lake Tahoe',
    'Memorable lakeside ceremony surrounded by family and close friends.',
    'On a gorgeous, sunny afternoon on August 19, 1995, Charles and Sarah were married at Emerald Bay, Lake Tahoe. The lake was a perfect turquoise, and a gentle breeze was blowing. Arthur gave a beautiful speech about how family is the anchor in any storm. We danced under the stars to a local jazz band. It was the start of our branch of the family, and we return to Tahoe every five years to celebrate.',
    'Traditions',
    '1995-08-19',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    'Charles and Sarah''s wedding at Lake Tahoe on August 19, 1995, featuring Arthur''s speech and family legacy.',
    (select array_agg(random())::real[] from generate_series(1, 1536))::vector
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Immigration to America',
    'Arthur recounts the journey crossing the Atlantic in 1962.',
    'In April 1962, Eleanor and I boarded the ocean liner with two suitcases and $200. Leaving our homeland was the hardest thing we ever did, but we knew we wanted to build a future in America. I remember seeing the Statue of Liberty through the morning fog; we both cried tears of fear and hope. That moment taught us that change is terrifying, but it is the only way to grow. We survived on dry bread and hope, but we made it.',
    'Family History',
    '1962-04-20',
    null,
    'Arthur and Eleanor''s immigration journey to America in 1962 with only two suitcases.',
    (select array_agg(random())::real[] from generate_series(1, 1536))::vector
  ),
  (
    'd5555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Emily''s Stanford Graduation',
    'Emily graduates with a degree in Computer Science.',
    'June 14, 2020 was a proud day. Emily walked the stage at Stanford University, receiving her Bachelor''s degree in Computer Science. Because of the pandemic, it was a smaller, intimate family ceremony in our backyard, but grandfather Arthur joined via Zoom and wore a suit. Emily represents the first engineer of our next generation, carrying on the family''s love of building and creating.',
    'Achievements',
    '2020-06-14',
    null,
    'Emily''s Stanford Computer Science graduation in 2020, celebrated with family and grandfather Arthur.',
    (select array_agg(random())::real[] from generate_series(1, 1536))::vector
  )
on conflict (id) do nothing;

-- Seed Timeline Events
insert into public.timeline_events (family_id, title, description, event_date, event_type)
values
  ('11111111-1111-1111-1111-111111111111', 'Arthur & Eleanor''s Immigration', 'Arthur and Eleanor arrived in New York by ship from Europe, searching for new opportunities.', '1962-04-20', 'Relocation'),
  ('11111111-1111-1111-1111-111111111111', 'Birth of Charles Sterling', 'Charles, first son of Arthur and Eleanor, was born in Chicago, Illinois.', '1968-07-22', 'Birth'),
  ('11111111-1111-1111-1111-111111111111', 'Founding of Sterling Manufacturing', 'Arthur opened the first machine shop in a leased garage, starting the family business.', '1975-11-01', 'Milestone'),
  ('11111111-1111-1111-1111-111111111111', 'Charles & Sarah''s Wedding', 'Charles and Sarah married in a lakeside ceremony at Emerald Bay, Lake Tahoe.', '1995-08-19', 'Wedding'),
  ('11111111-1111-1111-1111-111111111111', 'Birth of Emily Sterling', 'Emily, first grandchild of Arthur and Eleanor, was born in San Francisco, California.', '1998-02-14', 'Birth'),
  ('11111111-1111-1111-1111-111111111111', 'Birth of James Sterling', 'James was born, completing Charles and Sarah''s family.', '2001-08-30', 'Birth'),
  ('11111111-1111-1111-1111-111111111111', 'Emily''s Stanford Graduation', 'Emily graduated with a B.S. in Computer Science, starting her engineering career.', '2020-06-14', 'Achievement')
on conflict do nothing;
