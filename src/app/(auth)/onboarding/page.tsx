'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Library, FileText, ArrowRight, ShieldCheck } from 'lucide-react'
import KinsageLogo from '@/components/KinsageLogo'
import { createFamily } from '@/app/actions/family'

export default function OnboardingPage() {
  const [familyName, setFamilyName] = useState('')
  const [description, setDescription] = useState('')
  const [loadDemo, setLoadDemo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!familyName) {
      setError('Please provide a name for your Family Vault')
      setLoading(false)
      return
    }

    try {
      await createFamily(familyName, description, loadDemo)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while creating your vault.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center px-6 relative py-12">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-3xl -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl glass-panel p-8 rounded-3xl gold-border-glow space-y-8"
      >
        <div className="flex flex-col items-center text-center">
          <KinsageLogo className="w-14 h-14" />
          <h2 className="mt-6 text-3xl font-bold font-display tracking-tight">Initialize Your Family Vault</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Create a secure, private digital vault for your memories, wisdom, and lineage.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Family Vault Name</label>
            <div className="relative">
              <Library className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. The Sterling Family Archive"
                required
                className="w-full bg-background border border-border/80 hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">You can change this name anytime in Settings.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Preserving the legacy and oral history of our lineage..."
                className="w-full bg-background border border-border/80 hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Demo Seed Checkbox */}
          <div 
            onClick={() => setLoadDemo(!loadDemo)}
            className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
              loadDemo 
                ? 'bg-primary/5 border-primary/40 shadow-sm' 
                : 'bg-background border-border/80 hover:border-primary/20'
            }`}
          >
            <div className="flex gap-4 items-start">
              <input
                type="checkbox"
                checked={loadDemo}
                onChange={() => {}} // Controlled by outer div click
                className="mt-1 accent-primary"
              />
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <span>Preload Sterling Family Demo Data</span>
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Highly recommended. Pre-populates your vault with 3 generations of family members, pre-calculated vector embeddings, business wisdom, traditions, and historical timeline milestones. Allows immediate, out-of-the-box exploration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Kinsage uses Row Level Security. Your data is isolated and fully private.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Initializing Vault & Seeding...' : 'Initialize Vault'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
