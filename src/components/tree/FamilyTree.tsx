'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ZoomIn, ZoomOut, Maximize2, User, X, 
  Calendar, BookOpen, Clock, Heart, Sparkles
} from 'lucide-react'

interface FamilyMember {
  id: string
  family_id: string
  full_name: string
  relationship: string
  birth_date: string | null
  death_date: string | null
  biography: string | null
  avatar_url: string | null
}

interface Relationship {
  id: string
  family_id: string
  source_member: string
  target_member: string
  relationship_type: string
}

export default function FamilyTree({ 
  initialMembers, 
  initialRelationships,
  familyId
}: { 
  initialMembers: FamilyMember[]
  initialRelationships: Relationship[]
  familyId: string
}) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // Data State
  const [members] = useState<FamilyMember[]>(initialMembers)
  const [relationships] = useState<Relationship[]>(initialRelationships)
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [memberMemories, setMemberMemories] = useState<any[]>([])
  const [memoriesLoading, setMemoriesLoading] = useState(false)

  // Zoom / Pan State
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // 1. Dynamic Layout Algorithm (Generational Levels)
  const getLevel = (m: FamilyMember) => {
    const rel = m.relationship.toLowerCase()
    if (rel.includes('grand')) return 0
    if (rel.includes('father') || rel.includes('mother') || rel.includes('parent') || rel.includes('uncle') || rel.includes('aunt')) return 1
    if (rel.includes('son') || rel.includes('daughter') || rel.includes('child') || rel.includes('nephew') || rel.includes('niece') || rel.includes('grandchild')) return 2
    
    // Fallback by birth date
    if (m.birth_date) {
      const year = new Date(m.birth_date).getFullYear()
      if (year < 1950) return 0
      if (year < 1980) return 1
    }
    return 2
  }

  // Group members into rows by level
  const levels: { [key: number]: FamilyMember[] } = { 0: [], 1: [], 2: [] }
  members.forEach(m => {
    const lvl = getLevel(m)
    levels[lvl] = levels[lvl] || []
    levels[lvl].push(m)
  })

  // Pre-calculate positions
  const CANVAS_WIDTH = 900
  const Y_LEVEL_HEIGHT = 160
  const nodePositions: { [key: string]: { x: number; y: number } } = {}

  Object.keys(levels).forEach(lvlStr => {
    const lvl = parseInt(lvlStr)
    const row = levels[lvl] || []
    const count = row.length
    row.forEach((m, idx) => {
      const x = count === 1 
        ? CANVAS_WIDTH / 2 
        : (CANVAS_WIDTH / (count + 1)) * (idx + 1)
      const y = 80 + lvl * Y_LEVEL_HEIGHT
      nodePositions[m.id] = { x, y }
    })
  })

  // 2. Fetch associated memories when a member is clicked
  useEffect(() => {
    if (!selectedMember) return

    const fetchMemories = async () => {
      setMemoriesLoading(true)
      try {
        const res = await fetch('/api/memories')
        const data = await res.json()
        if (data.memories) {
          // Filter client-side
          const filtered = data.memories.filter((mem: any) => mem.member_id === selectedMember.id)
          setMemberMemories(filtered)
        }
      } catch (err) {
        console.error('Failed to load member memories:', err)
      } finally {
        setMemoriesLoading(false)
      }
    }

    fetchMemories()
  }, [selectedMember])

  // 3. Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('.profile-sidebar')) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const resetView = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  return (
    <div className="flex-1 flex overflow-hidden h-full relative select-none">
      
      {/* Zoom / Pan Toolbar Controls */}
      <div className="absolute top-6 left-6 z-20 bg-[#0b132b]/80 border border-[#1c2541] rounded-2xl p-2.5 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
          className="p-2 hover:bg-[#1c2541] rounded-xl text-primary transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          className="p-2 hover:bg-[#1c2541] rounded-xl text-primary transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-[#1c2541] mx-1"></div>
        <button
          onClick={resetView}
          className="p-2 hover:bg-[#1c2541] rounded-xl text-primary transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-muted-foreground px-2 font-mono">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Main Drag-Pan Canvas Screen */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden bg-background bg-[radial-gradient(#1c2541_1px,transparent_1px)] [background-size:24px_24px] ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* SVG Connection Layer */}
          <svg 
            width={CANVAS_WIDTH} 
            height={500} 
            className="absolute z-0 overflow-visible pointer-events-none"
          >
            {/* Draw Relationships */}
            {relationships.map((rel) => {
              const source = nodePositions[rel.source_member]
              const target = nodePositions[rel.target_member]

              if (!source || !target) return null

              if (rel.relationship_type === 'Spouse') {
                // Horizontal dotted link line for spouses
                return (
                  <line
                    key={rel.id}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#d4af37"
                    strokeWidth="3.5"
                    strokeDasharray="4 4"
                    className="opacity-75"
                  />
                )
              }

              if (rel.relationship_type === 'Parent') {
                // Curved Bezier linking parents to children
                const midY = (source.y + target.y) / 2
                return (
                  <path
                    key={rel.id}
                    d={`M ${source.x} ${source.y} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${target.y}`}
                    fill="none"
                    stroke="#1c2541"
                    strokeWidth="2.5"
                    className="opacity-80"
                  />
                )
              }

              return null
            })}
          </svg>

          {/* Interactive Graph Node Layer */}
          <div 
            style={{ width: CANVAS_WIDTH, height: 500 }}
            className="absolute z-10"
          >
            {members.map((member) => {
              const pos = nodePositions[member.id]
              if (!pos) return null

              const isSelected = selectedMember?.id === member.id

              return (
                <div
                  key={member.id}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="pointer-events-auto"
                >
                  <button
                    onClick={() => setSelectedMember(member)}
                    className={`w-28 h-28 rounded-full flex flex-col items-center justify-center p-1 transition-all duration-300 border-2 ${
                      isSelected 
                        ? 'border-primary bg-primary/10 shadow-lg gold-border-glow scale-105' 
                        : 'border-[#1c2541] bg-[#0b132b] hover:border-primary/50'
                    }`}
                  >
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.full_name} 
                        className="w-14 h-14 rounded-full object-cover border border-[#1c2541]" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#1c2541] flex items-center justify-center text-primary border border-[#1c2541]">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <span className="text-[10px] font-bold block mt-2 truncate w-full text-center px-1 text-slate-100">
                      {member.full_name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-muted-foreground block text-center leading-none mt-0.5">
                      {member.relationship}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Profile Detail Sidebar (Sliding Drawer on Right) */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="profile-sidebar absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#0b132b] border-l border-[#1c2541] shadow-2xl z-30 flex flex-col"
          >
            
            {/* Sidebar Header */}
            <div className="p-6 border-b border-[#1c2541] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Member Profile</span>
              <button 
                onClick={() => setSelectedMember(null)}
                className="p-1.5 hover:bg-[#1c2541] rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Profile Bio summary */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  {selectedMember.avatar_url ? (
                    <img 
                      src={selectedMember.avatar_url} 
                      alt={selectedMember.full_name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-md" 
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#1c2541] border border-[#1c2541] flex items-center justify-center text-primary">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">{selectedMember.full_name}</h3>
                  <span className="text-xs text-primary font-medium">{selectedMember.relationship}</span>
                </div>
                
                {/* Lifespan */}
                <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 bg-[#1c2541]/20 py-1.5 px-3 rounded-lg border border-[#1c2541] inline-flex">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {selectedMember.birth_date ? new Date(selectedMember.birth_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                  </span>
                  <span>-</span>
                  <span>
                    {selectedMember.death_date ? new Date(selectedMember.death_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Present'}
                  </span>
                </div>
              </div>

              {/* Biography details */}
              {selectedMember.biography && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Biography</span>
                  <p className="text-xs leading-relaxed text-slate-300 bg-[#040815]/50 border border-[#1c2541]/60 p-4 rounded-xl font-sans">
                    {selectedMember.biography}
                  </p>
                </div>
              )}

              {/* Associated Stories memories */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Related Memories ({memberMemories.length})</span>
                </span>

                {memoriesLoading ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span>Searching archives...</span>
                  </div>
                ) : memberMemories.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No stories linked to this member yet.</p>
                ) : (
                  <div className="space-y-3">
                    {memberMemories.map((mem) => (
                      <div 
                        key={mem.id}
                        className="bg-[#1c2541]/10 border border-[#1c2541] p-3 rounded-xl hover:border-primary/20 transition-all space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-primary rounded font-semibold">
                            {mem.category}
                          </span>
                          {mem.memory_date && (
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(mem.memory_date).getFullYear()}
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-semibold text-slate-200">{mem.title}</h5>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{mem.description || mem.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
