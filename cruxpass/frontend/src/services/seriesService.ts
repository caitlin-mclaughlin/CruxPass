import { SeriesData } from "@/models/domain";
import api from "./apiService";
import { CompetitionFormPayload, SeriesDto } from "@/models/dtos";

export async function getSeriesProfile(): Promise<SeriesDto> {
  const res = await api.get('/series/me');
  return res.data;
} 

export async function addCompetitionToSeries(seriesId: number, data: CompetitionFormPayload) {
  const res = api.put(`/series/${seriesId}/competitions`, data);
  return res;
} 

export async function updateSeries(data: Partial<SeriesData>) {
  const res = api.put('/series/me', data);
  return res;
} 

export async function getAllCompetitionsForSeries(seriesId: number) {
  const res = api.get(`/series/${seriesId}/competitions`);
  return res;
} 