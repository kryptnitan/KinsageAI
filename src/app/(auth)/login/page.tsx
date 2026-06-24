'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import KinsageLogo from '@/components/KinsageLogo'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
    } else {
      setSuccess('Authenticated successfully! Redirecting...')
      router.push('/overview')
      router.refresh()
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!email) {
      setError('Please enter your email')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback?next=/overview`,
      },
    })

    if (magicError) {
      setError(magicError.message)
      setLoading(false)
    } else {
      setMagicLinkSent(true)
      setSuccess('Magic Link sent! Please check your email inbox.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center px-6 relative py-12">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-3xl -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl gold-border-glow space-y-8"
      >
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <KinsageLogo className="w-12 h-12" />
          </Link>
          <h2 className="mt-6 text-2xl font-bold font-display tracking-tight">Welcome to Kinsage</h2>
          <p className="mt-2 text-sm text-muted-foreground">Preserving family wisdom across generations</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-start gap-3 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex bg-background border border-border/80 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setMode('password'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 rounded-lg transition-colors ${
              mode === 'password' ? 'bg-[#0b132b] text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Password Sign In
          </button>
          <button
            onClick={() => { setMode('magic'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 rounded-lg transition-colors ${
              mode === 'magic' ? 'bg-[#0b132b] text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Magic Link
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@family.com"
                  required
                  className="w-full bg-background border border-border/80 hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <Link
                  href="/reset-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-background border border-border/80 hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@family.com"
                  required
                  className="w-full bg-background border border-border/80 hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || magicLinkSent}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Sending link...' : 'Send Magic Link'}</span>
              {!loading && <Sparkles className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <span>Don't have an account? </span>
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
