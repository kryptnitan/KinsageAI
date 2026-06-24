'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Search, Filter, BookOpen, Clock, 
  Baby, Heart, Sparkles, Building, Landmark
} from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  event_type: string
}

const EVENT_TYPES = [
  'All',
  'Birth',
  'Wedding',
  'Milestone',
  'Business',
  'Relocation'
]

export default function TimelineView({ initialEvents }: { initialEvents: TimelineEvent[] }) {
  const [events] = useState<TimelineEvent[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')

  // Helper to retrieve icons matching event type
  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'birth':
        return <Baby className="w-4 h-4 text-pink-400" />
      case 'wedding':
        return <Heart className="w-4 h-4 text-red-400" />
      case 'business':
        return <Building className="w-4 h-4 text-cyan-400" />
      case 'relocation':
        return <Landmark className="w-4 h-4 text-orange-400" />
      default:
        return <Sparkles className="w-4 h-4 text-primary" />
    }
  };

  const displayedEvents = events.filter(evt => {
    // 1. Filter Type
    if (selectedType !== 'All' && evt.event_type !== selectedType) {
      return false
    }

    // 2. Filter Keyword
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const titleMatch = evt.title.toLowerCase().includes(query)
      const descMatch = evt.description?.toLowerCase().includes(query) || false
      return titleMatch || descMatch
    }

    return true
  })

  return (
    <div className="space-y-6">
      
      {/* Controls: Search and Filters */}
      <div className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-grow">
            <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-4 top-3.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline events..."
              className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-colors"
            />
          </div>

          {/* Type Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  selectedType === type 
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                    : 'bg-background border-[#1c2541] text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Tree display */}
      {displayedEvents.length === 0 ? (
        <div className="border border-[#1c2541] rounded-3xl p-16 text-center text-muted-foreground space-y-3 bg-[#0b132b]/10 max-w-md mx-auto">
          <Clock className="w-10 h-10 text-primary/40 mx-auto mb-1" />
          <h4 className="text-base font-semibold text-slate-200">No events plotted</h4>
          <p className="text-sm">Upload stories with milestones to populate your chronological archive.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#1c2541] pl-8 ml-4 md:ml-24 space-y-8 py-4">
          {displayedEvents.map((evt, idx) => {
            const eventYear = new Date(evt.event_date).toLocaleDateString(undefined, { year: 'numeric' })
            const eventDateStr = new Date(evt.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
            
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: Math.min(0.3, idx * 0.05) }}
                key={evt.id}
                className="relative"
              >
                
                {/* Dotted indicator in the timeline line */}
                <div className="absolute -left-12.5 top-2 w-9 h-9 rounded-full bg-[#040815] border-2 border-[#1c2541] flex items-center justify-center shadow-lg">
                  {getEventIcon(evt.event_type)}
                </div>

                {/* Left side static year badge on desktop view */}
                <div className="hidden md:block absolute -left-28 top-3.5 w-18 text-right pr-4">
                  <span className="text-sm font-bold text-primary font-display">{eventYear}</span>
                </div>

                {/* Main Card */}
                <div className="bg-[#0b132b]/40 border border-[#1c2541]/80 p-5 rounded-2xl max-w-3xl space-y-3 hover:border-primary/20 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2541]/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{evt.event_type}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-xs text-slate-300 font-semibold">{eventDateStr}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{evt.title}</h3>
                  {evt.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">{evt.description}</p>
                  )}
                </div>

              </motion.div>
            )
          })}
        </div>
      )}

    </div>
  )
}
