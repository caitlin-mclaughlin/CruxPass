// LeaderboardPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { COMPETITOR_GROUPS, GENDER_OPTIONS, CompetitionEnumMap, GenderEnumMap, CompetitorGroup, Gender, GroupGenderKey } from '@/constants/enum'
import { RankedSubmissionDto } from '@/models/dtos'
import api from '@/services/apiService'
import { LeaderboardTable } from '@/components/LeaderboardTable'

const results: Partial<Record<GroupGenderKey, RankedSubmissionDto[]>> = {}

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>()
  const [competitionName, setCompetitionName] = useState('')
  const [rankingsByGroupGender, setRankingsByGroupGender] = useState<Record<GroupGenderKey, RankedSubmissionDto[]>>(
    () => ({}) as Record<GroupGenderKey, RankedSubmissionDto[]>
  )

  useEffect(() => {
    if (!id) return

    const fetchAllRankings = async () => {
      try {
        const { data: comp } = await api.get(`/competitions/${id}`)
        setCompetitionName(comp.name)
        
        const enabledCombos: GroupGenderKey[] = []
        for (const group of comp.competitorGroups) {
          for (const division of comp.divisions) {
            enabledCombos.push(`${group}-${division}` as GroupGenderKey)
          }
        }
        
        // Fetch rankings only for actual combos
        for (const key of enabledCombos) {
          const [group, division] = key.split('-') as [CompetitorGroup, Gender]
          try {
            const { data } = await api.get(`/competitions/${id}/rankings`, {
              params: { group, division }
            })
            if (data.length > 0) {
              results[key as GroupGenderKey] = data
            } else {
              console.log("data length not greater than 0")
            }
          } catch (err) {
            console.warn(`No data for ${key}`, err)
          }
        }

        setRankingsByGroupGender(results as Record<GroupGenderKey, RankedSubmissionDto[]>)
      } catch (err) {
        console.error('Failed to fetch leaderboard', err)
      }
    }

    fetchAllRankings()
  }, [id])

  return (
    <div className="flex felx-col p-8 h-screen bg-background text-green">
      <h1 className="text-3xl font-bold mb-6">{competitionName} Leaderboard</h1>

      <div>
        {Object.entries(rankingsByGroupGender).map(([key, entries]) => {
          const [group, division] = key.split('-') as [CompetitorGroup, Gender]
          return (
            <div key={key} className="mb-10">
              <h2 className="text-xl font-semibold mb-2">
                {CompetitionEnumMap[group]} – {GenderEnumMap[division]}
              </h2>
              <LeaderboardTable entries={entries} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
