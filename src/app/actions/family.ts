'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createFamily(name: string, description: string, loadDemo: boolean) {
  const supabase = await createClient()

  // Get current user (fallback to demo user for free bypass auth)
  const user = (await supabase.auth.getUser()).data.user || { id: '00000000-0000-0000-0000-000000000000' }

  // Create family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      family_name: name,
      description: description,
      owner_id: user.id
    })
    .select()
    .single()

  if (familyError || !family) {
    throw new Error(`Failed to create family: ${familyError?.message}`)
  }

  if (loadDemo) {
    // Seed demo data for this family
    try {
      await seedFamilyDemoData(family.id)
    } catch (e) {
      console.error('Failed to seed family demo data:', e)
    }
  }

  return redirect('/overview')
}

// Check if user has a family, if not redirect to onboarding
export async function checkUserOnboarding() {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user || { id: '00000000-0000-0000-0000-000000000000' }

  const { data: families } = await supabase
    .from('families')
    .select('id')
    .eq('owner_id', user.id)

  if (!families || families.length === 0) {
    return redirect('/onboarding')
  }

  return families[0].id
}

async function seedFamilyDemoData(familyId: string) {
  const supabase = await createClient()

  // 1. Insert Family Members
  const members = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      family_id: familyId,
      full_name: 'Arthur Sterling',
      relationship: 'Grandfather',
      birth_date: '1938-04-12',
      biography: 'Founder of Sterling Manufacturing. Immigrated to the United States in 1962. Believes in hard work, integrity, and family unity.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      family_id: familyId,
      full_name: 'Eleanor Sterling',
      relationship: 'Grandmother',
      birth_date: '1941-09-18',
      biography: 'Retired schoolteacher and family historian. Keeps the family stories alive and preserves historical records.',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      family_id: familyId,
      full_name: 'Charles Sterling',
      relationship: 'Father',
      birth_date: '1968-07-22',
      biography: 'CEO of Sterling Manufacturing. Enthusiastic gardener and cook. Dedicated to expanding the family business with sustainable tech.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      family_id: familyId,
      full_name: 'Sarah Sterling',
      relationship: 'Mother',
      birth_date: '1970-11-05',
      biography: 'Pediatrician at Mercy Hospital. Loves hiking, classical music, and organizing family gatherings.',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      family_id: familyId,
      full_name: 'Emily Sterling',
      relationship: 'Daughter',
      birth_date: '1998-02-14',
      biography: 'Software Engineer living in San Francisco. Loves coding, photography, and keeping track of family histories digitally.',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      family_id: familyId,
      full_name: 'James Sterling',
      relationship: 'Son',
      birth_date: '2001-08-30',
      biography: 'College student majoring in Environmental Science. Passionate about outdoor sports, music, and conservation.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  ]

  const { error: memsError } = await supabase.from('family_members').insert(members)
  if (memsError) throw memsError

  // 2. Insert Relationships
  const relationships = [
    { family_id: familyId, source_member: 'a1111111-1111-1111-1111-111111111111', target_member: 'a2222222-2222-2222-2222-222222222222', relationship_type: 'Spouse' },
    { family_id: familyId, source_member: 'a1111111-1111-1111-1111-111111111111', target_member: 'b1111111-1111-1111-1111-111111111111', relationship_type: 'Parent' },
    { family_id: familyId, source_member: 'a2222222-2222-2222-2222-222222222222', target_member: 'b1111111-1111-1111-1111-111111111111', relationship_type: 'Parent' },
    { family_id: familyId, source_member: 'b1111111-1111-1111-1111-111111111111', target_member: 'b2222222-2222-2222-2222-222222222222', relationship_type: 'Spouse' },
    { family_id: familyId, source_member: 'b1111111-1111-1111-1111-111111111111', target_member: 'c1111111-1111-1111-1111-111111111111', relationship_type: 'Parent' },
    { family_id: familyId, source_member: 'b2222222-2222-2222-2222-222222222222', target_member: 'c1111111-1111-1111-1111-111111111111', relationship_type: 'Parent' },
    { family_id: familyId, source_member: 'b1111111-1111-1111-1111-111111111111', target_member: 'c2222222-2222-2222-2222-222222222222', relationship_type: 'Parent' },
    { family_id: familyId, source_member: 'b2222222-2222-2222-2222-222222222222', target_member: 'c2222222-2222-2222-2222-222222222222', relationship_type: 'Parent' }
  ]

  const { error: relsError } = await supabase.from('relationships').insert(relationships)
  if (relsError) throw relsError

  // Helper to generate a dummy 1536 float array embedding
  const makeEmbedding = () => Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 0.1)

  // 3. Insert Memories
  const memories = [
    {
      family_id: familyId,
      member_id: 'a1111111-1111-1111-1111-111111111111',
      title: 'The Founding of Sterling Manufacturing',
      description: 'Arthur explains how he started the business from a Chicago garage.',
      content: 'In the winter of 1975, with just $1,500 in savings and a handful of hand tools, I opened the first workshop of Sterling Manufacturing in a leased garage. It was freezing cold, and the roof leaked, but we had a fire in our bellies. I worked 14-hour days, machining precision components for local factories. The key to our survival was reputation. We never shipped a part that wasn\'t perfect. Always treat your clients with respect and stand behind your quality.',
      category: 'Business Knowledge',
      memory_date: '1975-11-01',
      media_url: null,
      summary: 'Arthur shares the beginning of Sterling Manufacturing in 1975, emphasizing reputation and quality.',
      embedding: makeEmbedding()
    },
    {
      family_id: familyId,
      member_id: 'a2222222-2222-2222-2222-222222222222',
      title: 'Grandma Eleanor\'s Famous Apple Pie',
      description: 'The secret family recipe passed down through generations.',
      content: 'Here is the secret to the perfect crust: use half butter and half shortening, and make sure the water is ice-cold. For the filling, mix Granny Smith and Honeycrisp apples. Mix 1 cup sugar, 2 tbsp flour, 1 tsp cinnamon, and a pinch of nutmeg. Bake at 425°F for 15 minutes, then reduce to 375°F for 45 minutes until golden. This recipe was taught to me by my mother, and it has brought our family together around the dining table for every Thanksgiving since 1980.',
      category: 'Recipes',
      memory_date: '1980-11-27',
      media_url: null,
      summary: 'Eleanor\'s signature Apple Pie recipe and crust-making secrets, a family Thanksgiving tradition.',
      embedding: makeEmbedding()
    },
    {
      family_id: familyId,
      member_id: 'b1111111-1111-1111-1111-111111111111',
      title: 'Charles and Sarah\'s Wedding in Lake Tahoe',
      description: 'Memorable lakeside ceremony surrounded by family and close friends.',
      content: 'On a gorgeous, sunny afternoon on August 19, 1995, Charles and Sarah were married at Emerald Bay, Lake Tahoe. The lake was a perfect turquoise, and a gentle breeze was blowing. Arthur gave a beautiful speech about how family is the anchor in any storm. We danced under the stars to a local jazz band. It was the start of our branch of the family, and we return to Tahoe every five years to celebrate.',
      category: 'Traditions',
      memory_date: '1995-08-19',
      media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      summary: 'Charles and Sarah\'s wedding at Lake Tahoe on August 19, 1995, featuring Arthur\'s speech and family legacy.',
      embedding: makeEmbedding()
    },
    {
      family_id: familyId,
      member_id: 'a1111111-1111-1111-1111-111111111111',
      title: 'Immigration to America',
      description: 'Arthur recounts the journey crossing the Atlantic in 1962.',
      content: 'In April 1962, Eleanor and I boarded the ocean liner with two suitcases and $200. Leaving our homeland was the hardest thing we ever did, but we knew we wanted to build a future in America. I remember seeing the Statue of Liberty through the morning fog; we both cried tears of fear and hope. That moment taught us that change is terrifying, but it is the only way to grow. We survived on dry bread and hope, but we made it.',
      category: 'Family History',
      memory_date: '1962-04-20',
      media_url: null,
      summary: 'Arthur and Eleanor\'s immigration journey to America in 1962 with only two suitcases.',
      embedding: makeEmbedding()
    },
    {
      family_id: familyId,
      member_id: 'c1111111-1111-1111-1111-111111111111',
      title: 'Emily\'s Stanford Graduation',
      description: 'Emily graduates with a degree in Computer Science.',
      content: 'June 14, 2020 was a proud day. Emily walked the stage at Stanford University, receiving her Bachelor\'s degree in Computer Science. Because of the pandemic, it was a smaller, intimate family ceremony in our backyard, but grandfather Arthur joined via Zoom and wore a suit. Emily represents the first engineer of our next generation, carrying on the family\'s love of building and creating.',
      category: 'Achievements',
      memory_date: '2020-06-14',
      media_url: null,
      summary: 'Emily\'s Stanford Computer Science graduation in 2020, celebrated with family and grandfather Arthur.',
      embedding: makeEmbedding()
    }
  ]

  const { error: memsSaveError } = await supabase.from('memories').insert(memories)
  if (memsSaveError) throw memsSaveError

  // 4. Insert Timeline Events
  const timelineEvents = [
    { family_id: familyId, title: 'Arthur & Eleanor\'s Immigration', description: 'Arthur and Eleanor arrived in New York by ship from Europe, searching for new opportunities.', event_date: '1962-04-20', event_type: 'Relocation' },
    { family_id: familyId, title: 'Birth of Charles Sterling', description: 'Charles, first son of Arthur and Eleanor, was born in Chicago, Illinois.', event_date: '1968-07-22', event_type: 'Birth' },
    { family_id: familyId, title: 'Founding of Sterling Manufacturing', description: 'Arthur opened the first machine shop in a leased garage, starting the family business.', event_date: '1975-11-01', event_type: 'Milestone' },
    { family_id: familyId, title: 'Charles & Sarah\'s Wedding', description: 'Charles and Sarah married in a lakeside ceremony at Emerald Bay, Lake Tahoe.', event_date: '1995-08-19', event_type: 'Wedding' },
    { family_id: familyId, title: 'Birth of Emily Sterling', description: 'Emily, first grandchild of Arthur and Eleanor, was born in San Francisco, California.', event_date: '1998-02-14', event_type: 'Birth' },
    { family_id: familyId, title: 'Birth of James Sterling', description: 'James was born, completing Charles and Sarah\'s family.', event_date: '2001-08-30', event_type: 'Birth' },
    { family_id: familyId, title: 'Emily\'s Stanford Graduation', description: 'Emily graduated with a B.S. in Computer Science, starting her engineering career.', event_date: '2020-06-14', event_type: 'Achievement' }
  ]

  const { error: timelineError } = await supabase.from('timeline_events').insert(timelineEvents)
  if (timelineError) throw timelineError
}

export async function updateFamilySettings(familyId: string, name: string, description: string) {
  const supabase = await createClient()

  const user = (await supabase.auth.getUser()).data.user || { id: '00000000-0000-0000-0000-000000000000' }

  const { error } = await supabase
    .from('families')
    .update({ family_name: name, description: description })
    .eq('id', familyId)
    .eq('owner_id', user.id)

  if (error) throw error
  
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/overview')
}

export async function resetAndSeedFamily(familyId: string) {
  const supabase = await createClient()

  const user = (await supabase.auth.getUser()).data.user || { id: '00000000-0000-0000-0000-000000000000' }

  const { data: family } = await supabase
    .from('families')
    .select('id, owner_id')
    .eq('id', familyId)
    .single()

  if (!family || family.owner_id !== user.id) {
    throw new Error('Unauthorized')
  }

  // Delete all records of this family
  await supabase.from('memories').delete().eq('family_id', familyId)
  await supabase.from('relationships').delete().eq('family_id', familyId)
  await supabase.from('timeline_events').delete().eq('family_id', familyId)
  await supabase.from('conversations').delete().eq('family_id', familyId)
  await supabase.from('family_members').delete().eq('family_id', familyId)

  // Seed demo data
  await seedFamilyDemoData(familyId)

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/overview')
}

