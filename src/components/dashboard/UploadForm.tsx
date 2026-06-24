'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UploadCloud, FileText, X, CheckCircle, AlertCircle, 
  Sparkles, Calendar, Image, Volume2, User, ChevronDown
} from 'lucide-react'

interface FamilyMember {
  id: string
  full_name: string
  relationship: string
}

const CATEGORIES = [
  'Life Lessons',
  'Family History',
  'Traditions',
  'Recipes',
  'Achievements',
  'Business Knowledge',
  'Travel Stories',
  'Important Events'
]

export default function UploadForm({ members }: { members: FamilyMember[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form States
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [memberId, setMemberId] = useState('none')
  const [memoryDate, setMemoryDate] = useState('')
  
  // File States
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Status Pipeline State
  // 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'saving' | 'success' | 'error'
  const [status, setStatus] = useState<string>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a',
      'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const isValidType = validTypes.includes(file.type) || ['pdf', 'docx', 'm4a', 'mp3', 'wav'].includes(fileExt || '')
    const maxSizeBytes = 25 * 1024 * 1024 // 25 MB Limit

    if (!isValidType) {
      setErrorMessage('Unsupported file type. Please select an Image, Audio (MP3/WAV/M4A), or PDF/DOCX Document.')
      setStatus('error')
      return
    }

    if (file.size > maxSizeBytes) {
      setErrorMessage('File size exceeds the 25MB limit.')
      setStatus('error')
      return
    }

    setSelectedFile(file)
    setErrorMessage('')
    if (status === 'error') setStatus('idle')
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getPipelineMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading raw file and saving record to secure vault...'
      case 'transcribing':
        return 'Invoking OpenAI Whisper to transcribe audio recording...'
      case 'analyzing':
        return 'GPT running deep entity, relationship, and milestone extraction...'
      case 'saving':
        return 'Calculating 1536-dimensional vector embedding & writing database entries...'
      default:
        return 'Processing...'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setErrorMessage('Title is required')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('content', content)
      formData.append('category', category)
      formData.append('memberId', memberId)
      formData.append('memoryDate', memoryDate)

      if (selectedFile) {
        formData.append('file', selectedFile)
        // Transition status if audio
        if (selectedFile.type.startsWith('audio/')) {
          setTimeout(() => setStatus('transcribing'), 1500)
        }
      }

      // We transition statuses to give that premium SaaS engine feel
      const analysisTimer = setTimeout(() => setStatus('analyzing'), 3500)
      const savingTimer = setTimeout(() => setStatus('saving'), 6500)

      const response = await fetch('/api/memories/upload', {
        method: 'POST',
        body: formData,
      })

      clearTimeout(analysisTimer)
      clearTimeout(savingTimer)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Server returned an error')
      }

      setStatus('success')
      
      // Clear form on success
      setTimeout(() => {
        setTitle('')
        setDescription('')
        setContent('')
        setSelectedFile(null)
        setMemoryDate('')
        setMemberId('none')
        setStatus('idle')
        router.push('/vault')
        router.refresh()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'An error occurred while uploading. Please verify your API keys and try again.')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      
      {status === 'error' && errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h5 className="font-semibold">Processing Failed</h5>
            <p className="text-xs">{errorMessage}</p>
          </div>
          <button onClick={() => setStatus('idle')} className="ml-auto text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Processing Pipeline Modal Overlay */}
      <AnimatePresence>
        {['uploading', 'transcribing', 'analyzing', 'saving', 'success'].includes(status) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-[#0b132b] border border-primary/20 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl gold-border-glow"
            >
              {status === 'success' ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-display">Memory Preserved</h3>
                  <p className="text-sm text-muted-foreground">The memory has been transcribed, analyzed, and saved to your family vault.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Rotating loader */}
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-display uppercase tracking-widest text-primary text-xs">
                      AI Pipeline Active
                    </h3>
                    <p className="text-base font-semibold">{getPipelineMessage()}</p>
                    <div className="w-full bg-[#1c2541] h-1.5 rounded-full overflow-hidden mt-3">
                      <div 
                        className={`h-full bg-primary transition-all duration-500 ${
                          status === 'uploading' ? 'w-1/4' : 
                          status === 'transcribing' ? 'w-2/4' : 
                          status === 'analyzing' ? 'w-3/4' : 'w-11/12'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 bg-[#0b132b]/40 border border-[#1c2541]/80 p-6 md:p-8 rounded-3xl">
        
        {/* Left Form fields (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memory Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arthur's First Machine Shop Garage"
              required
              className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">Brief Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of what this memory contains..."
              rows={2}
              className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Story Text (Optional)</label>
              <span className="text-[10px] text-muted-foreground">Use this field if you don't have an audio/doc upload</span>
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full memory story or details here..."
              rows={6}
              className="w-full bg-background border border-[#1c2541] hover:border-primary/20 focus:border-primary rounded-xl py-3 px-4 text-sm outline-none transition-colors resize-y font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* Right sidebar form fields (4 columns) */}
        <div className="lg:col-span-4 space-y-6 border-t lg:border-t-0 lg:border-l border-[#1c2541] pt-6 lg:pt-0 lg:pl-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-[#1c2541] rounded-xl py-3 px-4 text-sm outline-none appearance-none pr-10 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Associated Member</label>
            <div className="relative">
              <select 
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full bg-background border border-[#1c2541] rounded-xl py-3 px-4 text-sm outline-none appearance-none pr-10 cursor-pointer"
              >
                <option value="none">None / Shared Memory</option>
                {members.map(mem => (
                  <option key={mem.id} value={mem.id}>{mem.full_name} ({mem.relationship})</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memory Date (Approx.)</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5 pointer-events-none" />
              <input 
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full bg-background border border-[#1c2541] rounded-xl py-3 pl-12 pr-4 text-sm outline-none text-left"
              />
            </div>
          </div>

          {/* Media Drag and Drop File area */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Media Upload</label>
            
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-[#1c2541] hover:border-primary/20 hover:bg-[#1c2541]/10'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.pdf,.docx"
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-xs font-semibold block text-slate-300">Drag & drop or Click</span>
                <span className="text-[10px] text-muted-foreground block mt-1">Image, Audio, PDF, DOCX (Max 25MB)</span>
              </div>
            ) : (
              <div className="bg-background border border-[#1c2541] p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    {selectedFile.type.startsWith('image/') ? <Image className="w-4 h-4" /> : 
                     selectedFile.type.startsWith('audio/') ? <Volume2 className="w-4 h-4" /> : 
                     <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate text-slate-200">{selectedFile.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="p-1.5 hover:bg-[#1c2541]/40 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={status !== 'idle'}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Preserve Memory</span>
          </button>

        </div>

      </form>
    </div>
  )
}
