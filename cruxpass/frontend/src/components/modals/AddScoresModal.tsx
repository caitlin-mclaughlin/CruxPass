import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '../ui/Input'
import { LoadingSnippet } from '../ui/loading/LoadingSnippet'
import { BoulderGradeMap } from '@/constants/enum'
import { Route, SubmittedRoute } from '@/models/domain'
import { PublicRegistrationDto, SubmissionRequestDto } from '@/models/dtos'
import {
  getMySubmissionsForComp,
  getRoutesForComp,
  submitScoresForComp,
} from '@/services/climberCompetitionService'

interface Props {
  open: boolean
  onClose: () => void
  gymId: number
  competitionId: number
  registrations?: PublicRegistrationDto[]
}

export default function AddScoresModal({
  open,
  onClose,
  competitionId,
  registrations = [],
}: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [submissions, setSubmissions] = useState<SubmittedRoute[]>([])
  const [activeClimberId, setActiveClimberId] = useState<number | null>(null)

  const activeRegistration = useMemo(() => {
    return registrations.find(registration => registration.climberId === activeClimberId)
      ?? registrations[0]
      ?? null
  }, [activeClimberId, registrations])

  useEffect(() => {
    if (!open) return
    setActiveClimberId(registrations[0]?.climberId ?? null)
  }, [open, registrations])

  useEffect(() => {
    if (!open || !activeRegistration?.climberId) return

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [routeData, submissionData] = await Promise.all([
          getRoutesForComp(competitionId),
          getMySubmissionsForComp(competitionId, activeRegistration.climberId),
        ])

        if (cancelled) return

        const sortedRoutes = [...routeData].sort((a, b) => a.number - b.number) as Route[]
        setRoutes(sortedRoutes)
        setSubmissions(mergeRouteSubmissions(sortedRoutes, submissionData))
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load scorecard', err)
          setError('Failed to load competition data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [activeRegistration?.climberId, competitionId, open])

  function mergeRouteSubmissions(routeData: Route[], submissionData: SubmittedRoute[]) {
    return routeData.map(route => {
      const existing = submissionData.find(submission => submission.routeId === route.id)
      return existing ?? {
        routeId: route.id as number,
        attempts: 0,
        send: false,
      }
    })
  }

  function updateSubmission(routeId: number, patch: Partial<SubmittedRoute>) {
    setSubmissions(prev => prev.map(submission =>
      submission.routeId === routeId
        ? { ...submission, ...patch }
        : submission
    ))
  }

  async function handleSubmit() {
    if (!activeRegistration?.climberId) return

    const hasInvalidSend = submissions.some(
      submission => submission.send && (!submission.attempts || isNaN(submission.attempts))
    )
    if (hasInvalidSend) {
      setError('Please enter attempts for all "Send" routes.')
      return
    }

    const payload: SubmissionRequestDto & { climberId: number } = {
      climberId: activeRegistration.climberId,
      routes: submissions,
    }

    try {
      setLoading(true)
      setError(null)
      await submitScoresForComp(competitionId, payload, activeRegistration.climberId)
      onClose()
    } catch (err) {
      console.error('Failed to submit scores', err)
      setError('Failed to submit scores. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => { if (!val) onClose() }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Submit Scores</DialogTitle>
          <DialogDescription>Enter attempts and mark which routes you send.</DialogDescription>
        </DialogHeader>

        {registrations.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Active Climber</div>
            <div className="flex flex-wrap gap-2">
              {registrations.map(registration => (
                <button
                  key={registration.climberId}
                  type="button"
                  aria-pressed={registration.climberId === activeRegistration?.climberId}
                  onClick={() => setActiveClimberId(registration.climberId ?? null)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold shadow-md ${
                    registration.climberId === activeRegistration?.climberId
                      ? 'border-highlight bg-highlight text-background'
                      : 'border-green/20 bg-shadow text-green hover:bg-green hover:text-background'
                  }`}
                >
                  {registration.climberName}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSnippet />
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto rounded-md border border-green/20 bg-shadow shadow-md scrollbar-thin-green scroll-smooth">
              <table className="w-full border-collapse bg-background text-green">
                <thead>
                  <tr className="bg-green text-shadow">
                    <th className="p-2 border-r">Route #</th>
                    <th className="p-2 border-r">Grade</th>
                    <th className="p-2 border-r">Points</th>
                    <th className="p-2 text-center border-r">Attempts</th>
                    <th className="p-2 text-center">Send</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(row => {
                    const route = routes.find(route => route.id === row.routeId)
                    return (
                      <tr key={row.routeId} className="bg-shadow border-t">
                        <td className="p-2 text-center border-r">{route?.number ?? '—'}</td>
                        <td className="p-2 text-center border-r">{route?.grade ? BoulderGradeMap[route.grade] : '—'}</td>
                        <td className="p-2 text-center border-r">{route?.pointValue ?? '—'}</td>
                        <td className="p-2 text-center border-r">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            className="mx-auto max-w-20 bg-background text-center"
                            value={row.attempts.toString()}
                            onChange={(event) => {
                              const parsed = parseInt(event.target.value, 10)
                              updateSubmission(row.routeId, { attempts: isNaN(parsed) ? 0 : parsed })
                            }}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={row.send}
                            onClick={() => updateSubmission(row.routeId, { send: !row.send })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full border border-green/20 transition-colors focus:outline-none ${
                              row.send ? 'bg-green' : 'bg-background'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full border border-green/20 bg-shadow transition-transform ${
                                row.send ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {error && <div className="text-accent">{error}</div>}

            <Button onClick={handleSubmit} className="w-full">
              Submit Scores{activeRegistration ? ` for ${activeRegistration.climberName}` : ''}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
