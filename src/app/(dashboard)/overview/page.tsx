import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  Grid, Archive, Users, Calendar, Sparkles, 
  UploadCloud, ArrowRight, Clock, BookOpen, Eye
} from 'lucide-react'

export const revalidate = 0 // Disable caching for dashboard

export default async function OverviewPage() {
  const supabase = await createClient()

  // 1. Hardcoded Demo User for free access
  const user = { id: '00000000-0000-0000-0000-000000000000' }

  // 2. Get active family (auto-created if missing)
  let { data: families } = await supabase
    .from('families')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)

  if (!families || families.length === 0) {
    const { data: newFamily } = await supabase
      .from('families')
      .insert({
        id: '11111111-1111-1111-1111-111111111111',
        owner_id: user.id,
        family_name: 'The Sterling Family Archive',
        description: 'Preserving the legacy, wisdom, and memories of the Sterling family across three generations.'
      })
      .select('*')
      .single()

    if (newFamily) {
      families = [newFamily]
    }
  }

  const family = (families && families[0]) || {
    id: '11111111-1111-1111-1111-111111111111',
    family_name: 'The Sterling Family Archive'
  }
  const familyId = family.id

  // 3. Query stats in parallel for fast loading
  const [
    memoriesCountRes,
    membersCountRes,
    eventsCountRes,
    recentMemoriesRes
  ] = await Promise.all([
    supabase.from('memories').select('id', { count: 'exact', head: true }).eq('family_id', familyId),
    supabase.from('family_members').select('id', { count: 'exact', head: true }).eq('family_id', familyId),
    supabase.from('timeline_events').select('id', { count: 'exact', head: true }).eq('family_id', familyId),
    supabase.from('memories').select('id, title, description, category, memory_date, created_at, family_members(full_name)').eq('family_id', familyId).order('created_at', { ascending: false }).limit(3)
  ])

  const totalMemories = memoriesCountRes.count || 0
  const totalMembers = membersCountRes.count || 0
  const totalEvents = eventsCountRes.count || 0
  const recentMemories = recentMemoriesRes.data || []

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-[#0b132b] via-[#040815] to-[#0b132b] p-6 md:p-8 gold-border-glow">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Kinsage Family Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            Welcome back to the <span className="gold-gradient-text">{family.family_name}</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Preserve and explore your family stories, memories, and wisdom using RAG AI retrieval.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Memories', value: totalMemories, icon: Archive, href: '/vault' },
          { label: 'Family Members', value: totalMembers, icon: Users, href: '/tree' },
          { label: 'Timeline Milestones', value: totalEvents, icon: Calendar, href: '/timeline' },
          { label: 'AI Companion Search', value: 'Semantic', icon: Sparkles, href: '/companion' }
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link 
              key={idx} 
              href={stat.href}
              className="bg-[#0b132b]/40 border border-[#1c2541]/80 hover:border-primary/20 p-5 rounded-2xl transition-all duration-200 group block relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <div className="w-8 h-8 rounded-lg bg-[#1c2541]/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Two Column Grid */}
      <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Recent Uploads (Left column) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c2541] pb-3">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-primary" />
              <span>Recent Uploads</span>
            </h2>
            <Link 
              href="/vault" 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMemories.length === 0 ? (
              <div className="border border-[#1c2541] rounded-2xl p-8 text-center text-muted-foreground space-y-4 bg-[#0b132b]/10">
                <p className="text-sm">No memories uploaded yet. Build your vault legacy now.</p>
                <Link 
                  href="/upload" 
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm transition-all hover:bg-primary/95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload First Memory</span>
                </Link>
              </div>
            ) : (
              recentMemories.map((mem: any) => (
                <div 
                  key={mem.id} 
                  className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-semibold px-2 py-0.5 rounded">
                        {mem.category}
                      </span>
                      {mem.memory_date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(mem.memory_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold">{mem.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{mem.description}</p>
                    {mem.family_members && (
                      <p className="text-xs text-primary/80 font-medium">
                        About: {mem.family_members.full_name}
                      </p>
                    )}
                  </div>

                  <Link 
                    href={`/vault?id=${mem.id}`}
                    className="flex-shrink-0 bg-secondary hover:bg-secondary/80 text-foreground border border-[#1c2541] rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Detail</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions (Right column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border-b border-[#1c2541] pb-3">
            <h2 className="text-lg font-bold font-display">Quick Actions</h2>
          </div>

          <div className="grid gap-3">
            {[
              { title: 'Upload Memory', desc: 'Photos, audios, or stories.', href: '/upload', icon: UploadCloud },
              { title: 'AI Companion Chat', desc: 'Ask about family advice.', href: '/companion', icon: Sparkles },
              { title: 'Explore Family Tree', desc: 'View nodes & generations.', href: '/tree', icon: Users },
              { title: 'Timeline Map', desc: 'Inspect chronological cards.', href: '/timeline', icon: Calendar }
            ].map((action, idx) => {
              const Icon = action.icon
              return (
                <Link 
                  key={idx} 
                  href={action.href}
                  className="bg-[#0b132b]/40 border border-[#1c2541]/80 hover:border-primary/20 p-4 rounded-xl flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold leading-tight">{action.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </Link>
              )
            })}
          </div>
        </div>

      </div>

    </div>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className={props.className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}
