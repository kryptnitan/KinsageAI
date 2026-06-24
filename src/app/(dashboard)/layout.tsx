import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  Grid, Archive, Users, Calendar, MessageSquare, 
  UploadCloud, Settings, LogOut, Heart
} from 'lucide-react'
import KinsageLogo from '@/components/KinsageLogo'
import { logout } from '@/app/actions/auth'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Hardcoded Demo User for free access
  const user = { id: '00000000-0000-0000-0000-000000000000', email: 'demo@kinsage.ai' }

  // 2. Fetch user's active family (auto-created if missing)
  let { data: families } = await supabase
    .from('families')
    .select('id, family_name')
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
      .select('id, family_name')
      .single()

    if (newFamily) {
      families = [newFamily]
    }
  }

  const activeFamily = (families && families[0]) || {
    id: '11111111-1111-1111-1111-111111111111',
    family_name: 'The Sterling Family Archive'
  }

  const navItems = [
    { label: 'Overview', href: '/overview', icon: Grid },
    { label: 'Family Vault', href: '/vault', icon: Archive },
    { label: 'Family Tree', href: '/tree', icon: Users },
    { label: 'Timeline', href: '/timeline', icon: Calendar },
    { label: 'AI Companion', href: '/companion', icon: MessageSquare },
    { label: 'Upload Memory', href: '/upload', icon: UploadCloud },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-[#040815] text-[#f8fafc] overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1c2541] bg-[#0b132b]/40 backdrop-blur-md">
        
        {/* Header Logo */}
        <div className="p-6 border-b border-[#1c2541] flex items-center justify-between">
          <Link href="/">
            <KinsageLogo showText={true} className="w-8 h-8" textClassName="text-lg font-bold" />
          </Link>
        </div>

        {/* Family Badge */}
        <div className="px-6 py-4 border-b border-[#1c2541] bg-[#1c2541]/10">
          <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-0.5">Active Archive</span>
          <span className="text-sm font-semibold truncate block max-w-full text-slate-100">{activeFamily.family_name}</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-[#1c2541]/30 hover:border-l-2 hover:border-primary"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-[#1c2541] space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#1c2541] border border-primary/20 flex items-center justify-center font-bold text-primary uppercase text-sm select-none">
              {user.email ? user.email.slice(0, 2) : 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-200 block truncate leading-tight">
                {user.email || 'User Account'}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">Vault Owner</span>
            </div>
          </div>
          
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-950/30 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </form>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden border-b border-[#1c2541] bg-[#0b132b]/40 px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <KinsageLogo showText={true} className="w-7 h-7" textClassName="text-md font-bold" />
          </Link>

          {/* Simple Mobile Navigation Indicator */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/25">
              {activeFamily.family_name}
            </span>
          </div>
        </header>

        {/* Inner Page View (Scrollable) */}
        <main className="flex-1 overflow-y-auto bg-[#040815] relative">
          {children}
        </main>
      </div>

    </div>
  )
}
