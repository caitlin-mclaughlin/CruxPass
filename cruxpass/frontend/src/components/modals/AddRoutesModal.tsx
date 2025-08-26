import { useEffect, useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Route } from '@/models/domain'
import { RouteDto } from '@/models/dtos'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (routes: RouteDto[]) => void
  initialRoutes?: Route[] | null
}

export default function AddRoutesModal({ open, onClose, onSubmit, initialRoutes }: Props) {
  const [numRoutes, setNumRoutes] = useState<number | null>(null)
  const [pointValues, setPointValues] = useState<(number | null)[]>([])
  const [errors, setErrors] = useState<boolean[]>([])

  useEffect(() => {
    if (!open) return; // only initialize when opening

    if (initialRoutes) {
      const sorted = [...initialRoutes].sort((a, b) => a.number - b.number)
      setNumRoutes(sorted.length)
      setPointValues(sorted.map(r => r.pointValue))
      setErrors(Array(sorted.length).fill(false))
    } else {
      setNumRoutes(null)
      setPointValues([])
      setErrors([])
    }
  }, [open])


  const handleNumRoutesChange = (newValue: number | null) => {
    setNumRoutes(newValue)

    if (newValue === null || newValue < 1) {
      setPointValues([])
      setErrors([])
      return
    }

    setPointValues(prev => {
      const trimmed = prev.slice(0, newValue)
      const filled = Array.from({ length: newValue }, (_, i) => trimmed[i] ?? null)
      return filled
    })

    setErrors(prev => {
      const trimmed = prev.slice(0, newValue)
      const filled = Array.from({ length: newValue }, (_, i) => trimmed[i] ?? false)
      return filled
    })
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
    } as RouteDto))
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
          <div className="relative w-full">
            <input
              type="number"
              step={10}
              min={1}
              value={numRoutes && numRoutes > 0 ? numRoutes as number : ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || val == '0') {
                  handleNumRoutesChange(null)
                } else {
                  handleNumRoutesChange(parseInt(val, 10))
                }

              }}
              className={`form-input`}
            />

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-0.5">
              <button
                type="button"
                className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer rounded-t focus-visible:outline-none"
                onClick={() =>
                  handleNumRoutesChange(numRoutes === null ? 1 : numRoutes + 1)
                }
              >
                ▲
              </button>
              <button
                type="button"
                className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer rounded-b focus-visible:outline-none"
                onClick={() =>
                  handleNumRoutesChange(numRoutes === null || numRoutes == 1 ? null : numRoutes - 1)
                }
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {(typeof numRoutes === 'number' && numRoutes > 0) && (
          <div>
            <div className="max-h-80 overflow-y-auto bg-shadow border shadow rounded-md scrollbar-thin-green">
            <table className="w-full text-left bg-background border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border-r text-center">Route #</th>
                    <th className="p-2">Point Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: numRoutes }, (_, i) => (
                    <tr key={i} className="border-t">
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
                              errors[i] ? 'border-accent focus:border-accent' : ''
                            }`}
                          />

                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-0.5">
                            <button
                              type="button"
                              className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer rounded-t focus-visible:outline-select focus:text-select"
                              onClick={() =>
                                handlePointValueChange(i, (pointValues[i] ?? 0) + 10)
                              }
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer rounded-b focus:outline-select focus:text-select"
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
            </div>
            {errors.some(Boolean) && (
              <p className="text-accent mt-4">
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
