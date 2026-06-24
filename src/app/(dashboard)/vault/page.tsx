import React from 'react'
import VaultView from '@/components/dashboard/VaultView'

export const revalidate = 0

export default function VaultPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Family Vault</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Secure archive of your generations of family stories, recipes, documents, and historical lessons.
        </p>
      </div>

      <VaultView />
    </div>
  )
}
