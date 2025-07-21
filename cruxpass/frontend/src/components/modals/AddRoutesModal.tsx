import { useState } from 'react'
import { Dialog } from '@headlessui/react'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (routes: { number: number; pointValue: number }[]) => void
}

export default function AddRoutesModal({ open, onClose, onSubmit }: Props) {
  const [numRoutes, setNumRoutes] = useState<number | null>(null)
  const [pointValues, setPointValues] = useState<number[]>([])

  const handleNumRoutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setNumRoutes(value)
      setPointValues(Array(value).fill(0))
    } else {
      setNumRoutes(null)
      setPointValues([])
    }
  }

  const handlePointValueChange = (index: number, newValue: number) => {
    const newValues = [...pointValues]
    newValues[index] = newValue
    setPointValues(newValues)
  }

  const handleSubmit = () => {
    const routes = pointValues.map((value, index) => ({
      number: index + 1,
      pointValue: value,
    }))
    onSubmit(routes)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 bg-background">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-background p-6 rounded-md border border-green w-full max-w-md text-green">
          <Dialog.Title className="text-xl font-bold mb-4">Add Competition Routes</Dialog.Title>
          <div className="p-4 bg-shadow border border-green rounded-md">
            <div className="mb-4">
            <label className="block mb-1 font-medium">How many routes?</label>
            <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border bg-background rounded-md"
                value={numRoutes ?? ''}
                onChange={handleNumRoutesChange}
            />
            </div>

            {numRoutes && (
            <div className="max-h-64 overflow-y-auto border-t pt-4">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                    <th className="p-2 border-r flex justify-center item-center">Route #</th>
                    <th className="p-2">Point Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: numRoutes }, (_, i) => (
                    <tr key={i} className="border-b">
                        <td className="px-2 py-3.25 border-r flex justify-center item-center">{i + 1}</td>
                        <td className="p-2">
                        <input
                            type="number"
                            min="0"
                            className="w-full border px-2 py-1 rounded-md bg-background"
                            value={pointValues[i]}
                            onChange={(e) => handlePointValueChange(i, parseInt(e.target.value, 10) || 0)}
                        />
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
            <button
                className="px-4 py-2 bg-accent text-background font-semibold rounded-md hover:bg-accentHighlight"
                onClick={onClose}
            >
                Cancel
            </button>
            <button
                className="px-4 py-2 bg-green text-background font-semibold rounded-md hover:bg-select"
                onClick={handleSubmit}
                disabled={!numRoutes || pointValues.length === 0}
            >
                Save Routes
            </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
