'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, AlertCircle, Sparkles, Lock, 
  Database, Settings, RefreshCw, ShieldAlert
} from 'lucide-react'
import { updateFamilySettings, resetAndSeedFamily } from '@/app/actions/family'
import { updatePassword } from '@/app/actions/auth'

interface Family {
  id: string
  family_name: string
  description: string | null
}

export default function SettingsView({ 
  family, 
  userEmail 
}: { 
  family: Family
  userEmail: string
}) {
  const router = useRouter()

  // Family settings states
  const [familyName, setFamilyName] = useState(family.family_name)
  const [description, setDescription] = useState(family.description || '')
  
  // Password states
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Status states
  const [loadingType, setLoadingType] = useState<'family' | 'security' | 'reset' | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleFamilyUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingType('family')
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!familyName.trim()) {
      setErrorMsg('Family Vault Name is required')
      setLoadingType(null)
      return
    }

    try {
      await updateFamilySettings(family.id, familyName, description)
      setSuccessMsg('Vault settings updated successfully!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update vault settings')
    } finally {
      setLoadingType(null)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingType('security')
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in both password fields')
      setLoadingType(null)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      setLoadingType(null)
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      setLoadingType(null)
      return
    }

    try {
      const res = await updatePassword(password)
      if (res.error) {
        throw new Error(res.error)
      }
      setSuccessMsg('Password updated successfully!')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password')
    } finally {
      setLoadingType(null)
    }
  }

  const handleResetAndSeed = async () => {
    if (!confirm('WARNING: This will delete ALL current memories, family members, relationships, timeline events, and conversation histories in your vault and restore the default Sterling Family 3-generation demo data. Are you sure?')) {
      return
    }

    setLoadingType('reset')
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await resetAndSeedFamily(family.id)
      setSuccessMsg('Vault database reset and Sterling Family Demo Data preloaded!')
      router.push('/overview')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset and seed vault')
      setLoadingType(null)
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Toast Alert Feedback */}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl flex items-start gap-3 text-sm">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Seeding Loading overlay */}
      {loadingType === 'reset' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-[#0b132b] border border-primary/20 p-8 rounded-3xl text-center space-y-4 max-w-sm shadow-2xl gold-border-glow">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold font-display">Re-indexing Archive</h3>
            <p className="text-xs text-muted-foreground">Wiping database tables and seeding 3-generations of Sterling family records, relationships, and vector embeddings...</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Side: Family Settings Form (8 columns) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Family settings */}
          <form onSubmit={handleFamilyUpdate} className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c2541]/50 pb-3">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold font-display">Family Vault Customization</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Family Archive Name</label>
                <input 
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Archive Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingType === 'family'}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-xl text-xs transition-all disabled:opacity-50"
            >
              {loadingType === 'family' ? 'Saving settings...' : 'Save Settings'}
            </button>
          </form>

          {/* Password update */}
          <form onSubmit={handlePasswordUpdate} className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c2541]/50 pb-3">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold font-display">Update Password</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingType === 'security'}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-xl text-xs transition-all disabled:opacity-50"
            >
              {loadingType === 'security' ? 'Updating credentials...' : 'Update Password'}
            </button>
          </form>

        </div>

        {/* Right Side: Admin Utilities panel (4 columns) */}
        <div className="md:col-span-4 space-y-6">
          
          <div className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 border-b border-[#1c2541]/50 pb-3">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold font-display">Archivist Tools</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Account Email</span>
                <span className="text-sm font-semibold text-slate-200 block truncate">{userEmail}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Status</span>
                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/25 px-2.5 py-0.5 rounded text-[10px] font-bold">
                  Active Legacy Owner
                </span>
              </div>
            </div>

            {/* Reset / Reload Demo action */}
            <div className="pt-4 border-t border-[#1c2541]/50 space-y-4">
              <div className="flex gap-2 items-start text-xs text-muted-foreground">
                <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="leading-snug">Need to reset your testing state? This option wipes custom uploads and preloads the clean Sterling Family Tree seed data.</p>
              </div>

              <button
                type="button"
                onClick={handleResetAndSeed}
                className="w-full bg-secondary hover:bg-[#1c2541]/40 border border-[#1c2541] hover:border-primary/20 text-slate-200 font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>Reset & Seed Demo Data</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
