import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (routes: { number: number; pointValue: number | null }[]) => void
}

export default function AddRoutesModal({ open, onClose, onSubmit }: Props) {
  const [numRoutes, setNumRoutes] = useState<number | null>(null)
  const [pointValues, setPointValues] = useState<(number | null)[]>([])
  const [errors, setErrors] = useState<boolean[]>([])

  const handleNumRoutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setNumRoutes(value)
      setPointValues(Array(value).fill(null))
    } else {
      setNumRoutes(null)
      setPointValues([])
    }
    setErrors(Array(value).fill(false))
  }

  const handlePointValueChange = (index: number, newValue: number) => {
    const newValues = [...pointValues]
    newValues[index] = newValue
    setPointValues(newValues)
  }

  const handleSubmit = () => {
    if (!numRoutes) return

    const newErrors = pointValues.map((val) => val === null || isNaN(val))
    setErrors(newErrors)

    const hasErrors = newErrors.some(Boolean)
    if (hasErrors) return // don't submit if any errors

    const routes = pointValues.map((value, index) => ({
      number: index + 1,
      pointValue: value as number,
    }))
    onSubmit(routes)
    onClose()
  }

  const isFormValid = numRoutes && pointValues.every(val => typeof val === 'number' && !isNaN(val))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Routes</DialogTitle>
          <DialogDescription>Fill out the route information for your competition.</DialogDescription> 
        </DialogHeader>

        <div>
          <label className="font-semibold">Number of Routes:</label>
          <Input
            type="number"
            min="1"
            className="form-input"
            value={numRoutes ?? ''}
            onChange={handleNumRoutesChange}
          />
        </div>

        {numRoutes && (
          <div className="max-h-84 overflow-y-auto bg-shadow border shadow rounded-md scrollbar-thin-green">
          <table className="w-full text-left bg-background border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 border-r text-center">Route #</th>
                  <th className="p-2">Point Value</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: numRoutes }, (_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-2 py-2 border-r text-center">{i + 1}</td>
                    <td className="p-2">
                      <div className="relative w-full">
                        <input
                          type="number"
                          step={10}
                          min={0}
                          value={
                            pointValues[i] === null || isNaN(pointValues[i] as number)
                              ? ''
                              : pointValues[i] as number
                          }
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '') {
                              handlePointValueChange(i, NaN)
                            } else {
                              handlePointValueChange(i, parseInt(val, 10))
                            }
                          }}
                          className={`form-input bg-shadow pr-10 ${
                            errors[i] ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />

                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-0.5">
                          <button
                            type="button"
                            className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer rounded-t"
                            onClick={() =>
                              handlePointValueChange(i, (pointValues[i] ?? 0) + 10)
                            }
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer rounded-b"
                            onClick={() =>
                              handlePointValueChange(i, Math.max(0, (pointValues[i] ?? 0) - 10))
                            }
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.some(Boolean) && (
              <p className="text-accent text-sm mt-2">
                Please fill in all point values before saving.
              </p>
            )}
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full">
          Create Routes
        </Button>

      </DialogContent>
    </Dialog>
  )
}
