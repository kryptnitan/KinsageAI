'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Sparkles, Filter, Calendar, FileText, Image as ImageIcon,
  Volume2, Download, Eye, X, BookOpen, User, Tag
} from 'lucide-react'

interface Memory {
  id: string
  title: string
  description: string
  content: string
  category: string
  memory_date: string | null
  media_url: string | null
  summary: string | null
  created_at: string
  family_members?: {
    full_name: string
    relationship: string
  } | null
}

const CATEGORIES = [
  'All',
  'Life Lessons',
  'Family History',
  'Traditions',
  'Recipes',
  'Achievements',
  'Business Knowledge',
  'Travel Stories',
  'Important Events'
]

export default function VaultView() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  
  // RAG / Semantic result score indicator
  const [isSearching, setIsSearching] = useState(false)

  const fetchMemories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/memories')
      const data = await res.json()
      if (data.memories) {
        setMemories(data.memories)
      }
    } catch (error) {
      console.error('Failed to load memories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemories()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchType === 'keyword' || !searchQuery) {
      // Local keyword filter will apply
      setIsSearching(false)
      if (!searchQuery) {
        fetchMemories()
      }
      return
    }

    // AI Semantic Vector Search
    setLoading(true)
    setIsSearching(true)
    try {
      const res = await fetch(`/api/memories/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.memories) {
        setMemories(data.memories)
      }
    } catch (error) {
      console.error('Semantic search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter memories locally for keywords or when not doing semantic queries
  const displayedMemories = memories.filter(mem => {
    // 1. Filter Category
    if (selectedCategory !== 'All' && mem.category !== selectedCategory) {
      return false
    }

    // 2. Filter Keyword (only if not currently displaying active semantic RAG search results)
    if (searchType === 'keyword' && searchQuery) {
      const query = searchQuery.toLowerCase()
      const titleMatch = mem.title.toLowerCase().includes(query)
      const descMatch = mem.description?.toLowerCase().includes(query) || false
      const contentMatch = mem.content?.toLowerCase().includes(query) || false
      const authorMatch = mem.family_members?.full_name.toLowerCase().includes(query) || false
      return titleMatch || descMatch || contentMatch || authorMatch
    }

    return true
  })

  return (
    <div className="space-y-6">
      
      {/* Search & Filters Controls */}
      <div className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-5 rounded-3xl space-y-4">
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          {/* Text Input */}
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-4 top-3.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value === '') {
                  setIsSearching(false)
                  fetchMemories()
                }
              }}
              placeholder={searchType === 'semantic' ? "Ask the AI vault semantically, e.g. 'Arthur business advice'..." : "Search title, tags, or description..."}
              className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
            />
          </div>

          {/* Toggle Type */}
          <div className="flex bg-background border border-[#1c2541] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setSearchType('keyword'); setIsSearching(false); }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                searchType === 'keyword' ? 'bg-[#0b132b] text-foreground border border-[#1c2541]' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Keyword Search
            </button>
            <button
              type="button"
              onClick={() => setSearchType('semantic')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                searchType === 'semantic' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Vector (pgvector)</span>
            </button>
          </div>

          {/* Trigger Button */}
          <button 
            type="submit"
            className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary/95 transition-all shadow-md shadow-primary/5 active:scale-[0.98]"
          >
            {searchType === 'semantic' ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1c2541]/40">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                  : 'bg-background/25 border-[#1c2541] text-muted-foreground hover:text-foreground hover:bg-[#1c2541]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Semantic Indicator */}
      {isSearching && (
        <div className="bg-[#1c2541]/30 border border-primary/20 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Active Semantic Query Results (Sorted by similarity score)</span>
          <button 
            onClick={() => {
              setSearchQuery('')
              setIsSearching(false)
              fetchMemories()
            }} 
            className="hover:underline ml-3 font-bold"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Grid of cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Retrieving vault stories...</p>
        </div>
      ) : displayedMemories.length === 0 ? (
        <div className="border border-[#1c2541] rounded-3xl p-16 text-center text-muted-foreground space-y-3 bg-[#0b132b]/10 max-w-lg mx-auto">
          <BookOpen className="w-10 h-10 text-primary/40 mx-auto mb-1" />
          <h4 className="text-base font-semibold text-slate-200">No memories found</h4>
          <p className="text-sm">Try broadening your filters or upload a new legacy memory.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMemories.map((mem) => (
            <motion.div
              layout
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="bg-[#0b132b]/40 border border-[#1c2541]/80 hover:border-primary/20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm flex flex-col justify-between"
            >
              
              {/* Media Thumbnail */}
              {mem.media_url && mem.media_url.includes('photos') ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-[#1c2541]">
                  <img 
                    src={mem.media_url} 
                    alt={mem.title} 
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-primary border border-primary/20 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Image</span>
                  </div>
                </div>
              ) : mem.media_url && mem.media_url.includes('audio') ? (
                <div className="aspect-[16/10] w-full bg-[#1c2541]/20 border-b border-[#1c2541] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Volume2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Oral Audio Interview</span>
                </div>
              ) : null}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded">
                      {mem.category}
                    </span>
                    {mem.memory_date && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(mem.memory_date).getFullYear()}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-slate-100 group-hover:text-primary transition-colors">{mem.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {mem.description || mem.summary || mem.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1c2541]/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate font-medium">{mem.family_members?.full_name || 'Shared Vault Story'}</span>
                  </div>
                  <span className="text-primary hover:underline font-bold flex items-center gap-0.5 flex-shrink-0">
                    <span>Open</span>
                    <Eye className="w-3 h-3" />
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0b132b] border border-primary/20 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl gold-border-glow"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#1c2541] flex items-center justify-between flex-shrink-0 bg-[#0b132b]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2.5 py-0.5 rounded">
                      {selectedMemory.category}
                    </span>
                    {selectedMemory.memory_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(selectedMemory.memory_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-display leading-tight">{selectedMemory.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedMemory(null)}
                  className="p-1.5 hover:bg-[#1c2541]/50 rounded-xl text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                
                {/* Media Embed */}
                {selectedMemory.media_url && (
                  <div className="rounded-2xl border border-[#1c2541] overflow-hidden bg-slate-950">
                    {selectedMemory.media_url.includes('photos') ? (
                      <img 
                        src={selectedMemory.media_url} 
                        alt={selectedMemory.title} 
                        className="w-full object-contain max-h-[300px]" 
                      />
                    ) : selectedMemory.media_url.includes('audio') ? (
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                          <span className="text-xs font-semibold">Play Voice Audio Clip</span>
                        </div>
                        <audio 
                          src={selectedMemory.media_url} 
                          controls 
                          className="w-full accent-primary" 
                        />
                      </div>
                    ) : (
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-xs font-semibold">Document Archive Attachment</span>
                        </div>
                        <a 
                          href={selectedMemory.media_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-secondary border border-[#1c2541] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download file</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Grid info: description & associated member */}
                <div className="grid sm:grid-cols-2 gap-4 border-b border-[#1c2541]/40 pb-4">
                  <div className="bg-[#1c2541]/20 p-3.5 rounded-xl border border-[#1c2541]">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Author/Focus</span>
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <User className="w-4 h-4 text-primary" />
                      <span>{selectedMemory.family_members?.full_name || 'Shared Family Memory'}</span>
                      {selectedMemory.family_members?.relationship && (
                        <span className="text-xs text-muted-foreground">({selectedMemory.family_members.relationship})</span>
                      )}
                    </span>
                  </div>
                  {selectedMemory.description && (
                    <div className="bg-[#1c2541]/20 p-3.5 rounded-xl border border-[#1c2541]">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Description Summary</span>
                      <p className="text-xs text-slate-300 leading-snug">{selectedMemory.description}</p>
                    </div>
                  )}
                </div>

                {/* Full Transcript/Story text */}
                {selectedMemory.content && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Story Content / Transcript</span>
                    <div className="bg-[#040815]/80 p-5 rounded-2xl border border-[#1c2541] text-sm leading-relaxed text-slate-300 font-sans whitespace-pre-wrap">
                      {selectedMemory.content}
                    </div>
                  </div>
                )}

                {/* AI Insights & Summary */}
                {selectedMemory.summary && (
                  <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-primary text-xs uppercase font-bold tracking-widest">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                      <span>AI Extraction Synthesis</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-200">{selectedMemory.summary}</p>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
