import { CompetitorGroup, Gender } from "@/constants/enum";
import api from "./apiService";
import { RankedSubmissionDto } from "@/models/dtos";

export async function getScoresForComp(
  competitionId: number,
  group: CompetitorGroup,
  division?: Gender
): Promise<RankedSubmissionDto[]> {
  const res = await api.get(`/competitions/${competitionId}/rankings`, {
    params: { group, division }
  });
  // Defensive normalization
  return Array.isArray(res.data) ? res.data : [];
}


export async function getCompetition(id: number) {
  const res = api.get(`/competitions/${id}`);
  return res;
}
