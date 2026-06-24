'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowRight, Shield, Heart, Search, Users, Calendar, 
  Volume2, BookOpen, Lock, Sparkles, ChevronDown, Check,
  Camera, FileText, ChevronRight
} from 'lucide-react'
import KinsageLogo from '@/components/KinsageLogo'

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Previews State
  const [activeTab, setActiveTab] = useState<'tree' | 'timeline' | 'companion'>('companion')

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-primary selection:text-background">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <KinsageLogo showText={true} />
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition-colors">The Problem</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#preview" className="hover:text-foreground transition-colors">Interactive Demo</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/overview" 
              className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
            >
              Enter Archive
            </Link>
            <Link 
              href="/overview" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 gold-border-glow hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 flex flex-col items-center justify-center text-center px-6">
        {/* Abstract background grids/glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#0b132b]/80 border border-primary/25 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-primary mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Generational Intelligence Vault</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-display tracking-tight leading-tight mb-8">
            Every Family Has <br />
            <span className="gold-gradient-text">Wisdom Worth Preserving</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform family stories, traditions, memories, voice recordings, and life lessons into a living, private, AI-powered family archive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/overview" 
              className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all duration-300 hover:scale-[1.02]"
            >
              <span>Access Your Family Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#preview" 
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
            >
              <span>Explore Previews</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-20 border-t border-border/20 bg-background relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">The Loss of Legacy</h2>
            <p className="text-3xl sm:text-4xl font-semibold font-display">Why family stories fade away</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0b132b]/50 border border-border/40 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-red-950/20 text-red-400 rounded-xl flex items-center justify-center mb-6">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Unrecorded Voice & Oral History</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Oral stories told at dinner tables disappear. Once older generations pass on, their stories, voices, jokes, and expressions are lost forever.
              </p>
            </div>

            <div className="bg-[#0b132b]/50 border border-border/40 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-orange-950/20 text-orange-400 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Scattered & Siloed Media</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Photos stay on old hard drives, group chats, or dusty photo albums. There is no central, organized vault where they are connected to specific lives.
              </p>
            </div>

            <div className="bg-[#0b132b]/50 border border-border/40 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-yellow-950/20 text-yellow-400 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Lost Professional Wisdom</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                How did Grandpa build his business? What mistakes did he make? Professional and life advice is rarely written down, depriving future generations of guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-20 border-t border-border/20 bg-[#070d1e]/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Our Solution</h2>
              <h3 className="text-3xl sm:text-4xl font-semibold font-display mb-6">A Living Family Intelligence Vault</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Kinsage is more than a drive of family folders. It is a secure, interactive knowledge base. We use advanced artificial intelligence to synthesize memories, audio recordings, documents, and family trees into a single organic network.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Semantic Memory Retrieval: Ask natural questions.",
                  "Auto-Structured Timelines: Events plotted from stories.",
                  "Generational Visual Trees: Node link relations.",
                  "Zero data sharing: Encryption and absolute privacy."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10"></div>
              <div className="glass-panel p-8 rounded-3xl gold-border-glow max-w-xl mx-auto">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground ml-auto">Kinsage AI Processing Engine</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-background/80 p-4 rounded-xl border border-border/50 text-xs font-mono space-y-1">
                    <div className="text-primary font-semibold">User Upload: "audio_interview_grandpa_1975.mp3"</div>
                    <div className="text-muted-foreground">"In the winter of 1975, I started Sterling Manufacturing in a Chicago garage..."</div>
                  </div>

                  <div className="flex justify-center text-primary">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1c2541]/40 p-3 rounded-lg border border-border/50 text-xs">
                      <div className="font-semibold text-primary mb-1">Entities Extracted</div>
                      <div className="text-muted-foreground">Arthur Sterling (Grandfather), Chicago</div>
                    </div>
                    <div className="bg-[#1c2541]/40 p-3 rounded-lg border border-border/50 text-xs">
                      <div className="font-semibold text-primary mb-1">Milestones Created</div>
                      <div className="text-muted-foreground">1975-11-01: Founding of Sterling Mfg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Previews & Interactive Demo Section */}
      <section id="preview" className="py-24 border-t border-border/20 bg-background relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Live Sandbox Previews</h2>
            <h3 className="text-3xl sm:text-4xl font-semibold font-display mb-4">See how Kinsage structures your family intelligence</h3>
            <p className="text-muted-foreground">Click the features below to preview the platform interfaces.</p>
          </div>

          {/* Selector Tabs */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { id: 'companion', label: 'AI Companion', icon: Sparkles },
              { id: 'timeline', label: 'Interactive Timeline', icon: Calendar },
              { id: 'tree', label: 'Family Tree Visualizer', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10' 
                    : 'bg-[#0b132b]/40 border-border/40 hover:bg-[#1c2541]/40 text-muted-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sandbox Box */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 gold-border-glow min-h-[450px] flex flex-col justify-between max-w-5xl mx-auto">
            
            <AnimatePresence mode="wait">
              {activeTab === 'companion' && (
                <motion.div
                  key="companion"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 flex-grow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Chat Question */}
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">US</div>
                      <div className="bg-[#1c2541]/50 border border-border/50 p-4 rounded-2xl rounded-tl-none max-w-2xl">
                        <p className="text-sm">"How did Grandpa build his business, and what advice did he give about quality?"</p>
                      </div>
                    </div>

                    {/* Chat Answer */}
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-[#0b132b] border border-primary/40 flex items-center justify-center flex-shrink-0">
                        <KinsageLogo className="w-4 h-4" />
                      </div>
                      <div className="bg-[#0b132b] border border-border/50 p-5 rounded-2xl rounded-tl-none max-w-2xl space-y-4">
                        <div className="flex items-center gap-2 text-[10px] text-primary uppercase font-bold tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Kinsage Vault AI</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Grandpa Arthur Sterling founded <span className="text-foreground font-semibold">Sterling Manufacturing</span> in the winter of 1975, starting out in a small Chicago garage with only $1,500 in savings. 
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          His primary piece of advice concerning quality was: <span className="text-foreground italic">"We never shipped a part that wasn't perfect. Always treat your clients with respect and stand behind your quality."</span>
                        </p>

                        {/* Citation tag */}
                        <div className="pt-2 border-t border-border/30 flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Retrieved Sources:</span>
                          <span className="inline-flex items-center gap-1.5 bg-[#1c2541]/80 border border-border px-2.5 py-1 rounded-md text-xs font-semibold text-primary">
                            <FileText className="w-3 h-3" />
                            <span>The Founding of Sterling Manufacturing (1975)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex gap-3 items-center mt-6">
                    <input 
                      disabled
                      placeholder="Ask your family archive anything..."
                      className="bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-sm flex-grow text-muted-foreground outline-none cursor-not-allowed"
                    />
                    <button disabled className="bg-primary/50 text-primary-foreground px-5 py-3 rounded-xl cursor-not-allowed flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4">
                    <span className="font-display font-semibold text-lg text-primary">Sterling Family Timeline</span>
                    <span className="text-xs text-muted-foreground">7 Milestones Plotted</span>
                  </div>

                  <div className="relative border-l border-primary/20 pl-8 ml-4 space-y-8">
                    {[
                      { year: '1962', title: 'Immigration to New York', desc: 'Arthur and Eleanor immigrate with two bags.', tag: 'History' },
                      { year: '1975', title: 'Founding of Sterling Manufacturing', desc: 'Arthur opens shop in a small Chicago garage.', tag: 'Business' },
                      { year: '1995', title: 'Charles & Sarah\'s Wedding', desc: 'Lakeside wedding ceremony at Lake Tahoe.', tag: 'Wedding' }
                    ].map((evt, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-12 top-1.5 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-foreground">{evt.year}</span>
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{evt.tag}</span>
                          </div>
                          <h4 className="text-base font-semibold">{evt.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{evt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tree' && (
                <motion.div
                  key="tree"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="mb-4 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Dynamic Graph Visualization</span>
                  </div>

                  <div className="relative w-full max-w-xl aspect-[16/9] border border-border/50 rounded-2xl bg-background/50 flex flex-col justify-center items-center overflow-hidden">
                    
                    {/* Simplified mock interactive graphic tree */}
                    <div className="space-y-12 w-full px-8 relative">
                      {/* Generation 1 */}
                      <div className="flex justify-center gap-16">
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full border-2 border-primary bg-[#0b132b] flex items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-semibold text-primary">Arthur (GF)</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full border-2 border-primary bg-[#0b132b] flex items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-semibold text-primary">Eleanor (GM)</span>
                          </div>
                        </div>
                      </div>

                      {/* Generation 2 */}
                      <div className="flex justify-center gap-16 relative">
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full border-2 border-primary bg-[#0b132b] flex items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-semibold text-primary">Charles (F)</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-full border-2 border-border bg-[#0b132b] flex items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-semibold text-muted-foreground">Sarah (M)</span>
                          </div>
                        </div>
                      </div>

                      {/* Connection lines using absolute overlay (simulation) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                        <svg className="w-full h-full text-border/60" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="50" y1="20" x2="50" y2="70" stroke="currentColor" strokeWidth="1" />
                          <line x1="30" y1="70" x2="70" y2="70" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="text-[10px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-primary">Zoom: 100%</span>
                      <span className="text-[10px] bg-secondary/80 border border-border px-2 py-0.5 rounded text-muted-foreground">Pan Enabled</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section id="features" className="py-20 border-t border-border/20 bg-[#070d1e]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Feature Set</h2>
            <p className="text-3xl sm:text-4xl font-semibold font-display">Engineered to preserve wisdom</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Semantic Retrieval (RAG)", desc: "Interact with family memories naturally. Ask questions and get complete details with cited story cards." },
              { icon: Volume2, title: "Voice Transcription", desc: "Upload audio interviews. Our pipeline transcribes the files and extracts speakers automatically." },
              { icon: Users, title: "Interactive Graph", desc: "Visualize and map relationships between family members across generations in an interactive tree canvas." },
              { icon: Calendar, title: "Milestone Timelines", desc: "Chronological maps generated automatically from memories, plotting births, marriages, business start-ups." },
              { icon: Lock, title: "Private & Encrypted", desc: "Your data belongs to your family. Protected by strict Row Level Security policies and isolated storage." },
              { icon: FileText, title: "Document Scanning", desc: "Store certificates, scanned letters, recipes, and diaries. AI extracts the text for search indexes." }
            ].map((feat, idx) => (
              <div key={idx} className="bg-[#0b132b]/40 border border-border/50 p-6 rounded-2xl hover:border-primary/30 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold mb-2">{feat.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 border-t border-border/20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Workflow</h2>
            <p className="text-3xl sm:text-4xl font-semibold font-display">How Kinsage preserves stories</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Collect Memories", desc: "Upload photos, typed stories, audio recordings, or PDF family histories." },
              { step: "02", title: "AI Structuring", desc: "Our engine transcribes audio, structures metadata, and extracts family relationships." },
              { step: "03", title: "Index Vector Search", desc: "OpenAI creates embeddings to enable query answering of unstructured texts." },
              { step: "04", title: "Interact & Learn", desc: "Ask questions, explore timeline cards, and view family tree relationships dynamically." }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-4xl font-bold font-display text-primary/10 mb-4">{step.step}</div>
                <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-border/20 bg-[#070d1e]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Testimonials</h2>
            <p className="text-3xl sm:text-4xl font-semibold font-display">Preserving what matters most</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0b132b]/50 border border-border/40 p-8 rounded-2xl space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "Kinsage changed the way our family saves memories. My grandfather spent two hours speaking about his childhood on audio. Kinsage transcribed the session, and now my children can literally ask the AI questions and hear their great-grandfather's life lessons in detail."
              </p>
              <div>
                <h5 className="text-sm font-semibold text-foreground">David S.</h5>
                <span className="text-xs text-primary font-medium">Chicago, IL</span>
              </div>
            </div>

            <div className="bg-[#0b132b]/50 border border-border/40 p-8 rounded-2xl space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "Preserving the recipes, letters, and business wisdom of my mom has been our goal for years. Kinsage did it in days. The family tree and semantic search make exploring years of archives feel like chatting with a family companion."
              </p>
              <div>
                <h5 className="text-sm font-semibold text-foreground">Elena M.</h5>
                <span className="text-xs text-primary font-medium">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-border/20 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">FAQ</h2>
            <h3 className="text-3xl font-semibold font-display">Common Questions</h3>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is our family data private?", a: "Yes. Kinsage is built from the ground up as a private intelligence vault. Your files, stories, and trees are secured by Postgres Row Level Security (RLS). We do not share your private memory archives or use them to train public AI models." },
              { q: "What files are supported?", a: "We support text memories, images (PNG, JPEG, WebP), audio files (MP3, WAV, M4A, recording clips), and documents (PDF, DOCX)." },
              { q: "How does the AI Companion answer questions?", a: "When you ask a question, the system uses pgvector to find memories and transcripts related to your query. These memories are fed into the AI as contextual reference, allowing it to provide detailed answers citing the original sources." }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-border/40 bg-[#0b132b]/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-sm hover:bg-[#0b132b]/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/20">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border/20 bg-[#070d1e]/30 relative text-center">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-5xl font-semibold font-display mb-6">Preserve Your Family Wisdom Today</h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Begin cataloging stories, uploading letters, transcribing audio interviews, and connecting family branches in a private vault.
          </p>
          <Link 
            href="/overview" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all duration-300 hover:scale-[1.02]"
          >
            <span>Access Your Family Vault</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <KinsageLogo showText={true} />
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <a href="https://x.com/kinsageai?s=11" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">@KinsageAI</a>
            <span className="select-none text-border">|</span>
            <span className="text-xs">&copy; {new Date().getFullYear()} Kinsage AI. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
