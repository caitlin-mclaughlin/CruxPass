// FloatingSearch.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from './Input'

export default function FloatingSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-background p-6 rounded-md shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-1.5 right-1.5 text-green hover:text-select">
          <X className="w-5 h-5" />
        </button>
        <Input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search competitions, gyms, or series..."
        />
        {/* Add results display later */}
        <div className="mt-4 text-sm text-green">Search results will show here</div>
      </div>
    </div>
  )
}
