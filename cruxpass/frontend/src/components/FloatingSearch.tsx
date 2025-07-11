// FloatingSearch.tsx
import { useState } from 'react'
import { X } from 'lucide-react'

export default function FloatingSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white p-4 rounded shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users, competitions, or gyms..."
          className="w-full border px-3 py-2 rounded"
        />
        {/* Add results display later */}
        <div className="mt-4 text-sm text-gray-500">Search results will show here</div>
      </div>
    </div>
  )
}
