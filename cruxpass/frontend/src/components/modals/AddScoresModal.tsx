import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import debounce from 'lodash.debounce'
import { Route, SubmittedRoute } from '@/models/domain'
import { useGlobalCompetitions } from '@/context/GlobalCompetitionsContext'
import { useClimberCompetition } from '@/context/ClimberCompetitionContext'
import { SubmissionRequestDto } from '@/models/dtos'
import { CompetitorGroup, Gender } from '@/constants/enum'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (subs: SubmittedRoute[]) => void
  gymId: number
  competitionId: number
  competitorGroup: CompetitorGroup
  division: Gender
}

export default function AddScoresModal({
  open, 
  onClose, 
  onSuccess, 
  gymId,
  competitionId,
  competitorGroup,
  division
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getRoutesForComp } = useGlobalCompetitions()
  const { registration, routes, submissions, refreshAll, refreshRegistration, refreshSubmissions, updateSubmissions } = useClimberCompetition()

  // Fetch routes + existing submissions
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        refreshAll(gymId, competitionId);
      } catch (err) {
        setError("Failed to load competition data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, competitionId, gymId]);

  // Merge routes and submissions
  const rows = useMemo(() => {
    if (!routes || !submissions) return;
    return routes.map((route) => {
      const sub = submissions.find((s) => s.routeId === route.id)
      return sub ?? { routeId: route.id, attempts: 0, send: false }
    });
  }, [routes, submissions])
/*
  const debouncedSave = useMemo(() => debounce((updatedSubs: SubmittedRoute[]) => {
    handleSubmitScores()
    onSuccess(updatedSubs)
  }, 1500), [onSuccess]) // 1.5 sec delay

  // Call debouncedSave every time submissions change
  useEffect(() => {
    if (submissions.length > 0) {
      debouncedSave(submissions)
    }
  }, [submissions])

  // Cleanup to cancel debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [])
*/
  const handleSubmitScores = async () => {
    if (!competitionId || !gymId) return;

    const payload: SubmissionRequestDto = {
      competitorGroup,
      division,
      routes: submissions.filter(r => r.attempts > 0),
    };

    try {
      await updateSubmissions(gymId, competitionId, payload);
      refreshSubmissions(gymId, competitionId);
      onSuccess(submissions);
    } catch (err) {
      console.error('Failed to submit scores', err);
    }
  }

  const handleSubmit = async () => {
    const hasInvalid = submissions.some(
      (sub) => sub.send && (!sub.attempts || isNaN(sub.attempts))
    );
    if (hasInvalid) return;
    await handleSubmitScores();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(val: any) => { if (!val) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Your Scores</DialogTitle>
          <DialogDescription>Enter attempts and mark which routes you send.</DialogDescription>
        </DialogHeader>

        {loading ? (
          // Spinner state
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green" />
          </div>
        ) : error ? (
          // Error state
          <div className="text-accent text-center py-8">
            {error}
          </div>
        ) : (
          // Success state (your existing table)
          <div className="overflow-y-auto max-h-96 mt-2 bg-shadow border shadow rounded-md scrollbar-thin-green">
            <table className="w-full border-collapse bg-background text-green">
              <thead>
                <tr>
                  <th className="p-2 border-r">Route #</th>
                  <th className="p-2 border-r">Points</th>
                  <th className="py-2 flex justify-center text-center border-r">Attempts</th>
                  <th className="p-2 text-center">Send</th>
                </tr>
              </thead>
              <tbody>
                {rows && (
                  rows.map((row) => {
                    const route = routes.find((r) => r.id === row.routeId);
                    return (
                      <tr key={row.routeId} className="border-t">
                        <td className="p-2 text-center border-r">
                          {route?.number ?? "—"}
                        </td>
                        <td className="p-2 text-center border-r">
                          {route?.pointValue ?? "—"}
                        </td>

                        {/* Attempts */}
                        <td className="py-2 flex justify-center border-r">
                          <div className="relative max-w-20">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              className="form-input bg-shadow pr-5 text-center"
                              value={row.attempts.toString()}
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value, 10)
                                setSubmissions((prev) => {
                                  const existing = prev.find((s) => s.routeId === row.routeId)
                                  const updated = isNaN(parsed) ? 0 : parsed
                                  if (existing) {
                                    return prev.map((s) =>
                                      s.routeId === row.routeId ? { ...s, attempts: updated } : s
                                    )
                                  }
                                  return [
                                    ...prev,
                                    { routeId: row.routeId, attempts: updated, send: false }
                                  ]
                                })
                              }}
                            />
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                              <button
                                type="button"
                                className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer"
                                onClick={() => {
                                  setSubmissions((prev) => {
                                    const existingIndex = prev.findIndex(
                                      (s) => s.routeId === row.routeId
                                    );
                                    if (existingIndex !== -1) {
                                      const copy = [...prev];
                                      copy[existingIndex] = {
                                        ...copy[existingIndex],
                                        attempts: Math.max(
                                          0,
                                          (copy[existingIndex].attempts || 0) + 1
                                        ),
                                      };
                                      return copy;
                                    } else {
                                      return [
                                        ...prev,
                                        { routeId: row.routeId, attempts: 1, send: false },
                                      ];
                                    }
                                  });
                                }}
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="text-green hover:text-select w-6 h-5 text-xs cursor-pointer"
                                onClick={() => {
                                  setSubmissions((prev) => {
                                    const existingIndex = prev.findIndex(
                                      (s) => s.routeId === row.routeId
                                    );
                                    if (existingIndex !== -1) {
                                      const copy = [...prev];
                                      copy[existingIndex] = {
                                        ...copy[existingIndex],
                                        attempts: Math.max(
                                          0,
                                          (copy[existingIndex].attempts || 0) - 1
                                        ),
                                      };
                                      return copy;
                                    } else {
                                      return prev;
                                    }
                                  });
                                }}
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={row.send}
                            onClick={() => {
                              setSubmissions((prev) => {
                                const existing = prev.find((s) => s.routeId === row.routeId)
                                if (existing) {
                                  return prev.map((s) =>
                                    s.routeId === row.routeId ? { ...s, send: !s.send } : s
                                  )
                                }
                                return [...prev, { routeId: row.routeId, attempts: 0, send: true }]
                              })
                            }}
                            className={`relative inline-flex h-6 w-11 border border-green items-center rounded-full transition-colors focus:outline-none ${
                              row.send ? 'bg-green' : 'bg-shadow'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full border border-green bg-background transition-transform ${
                                row.send? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && submissions && (
          <>
            {submissions.some(
              sub => sub.send && (typeof sub.attempts !== 'number' || sub.attempts === 0)
            ) && (
              <div className="text-accent">
                Please enter attempts for all "Send" routes.
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full">
              Submit Scores
            </Button>
          </>
        )}
        
      </DialogContent>
    </Dialog>
  )
}
