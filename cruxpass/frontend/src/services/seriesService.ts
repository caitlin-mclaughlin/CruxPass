import { SeriesData } from "@/models/domain";
import api from "./apiService";
import { CompetitorGroupDto, CreateCompetitorGroupDto, ResolvedCompetitorGroup, SeriesDto, SimpleCompetitionDto, SimpleGymDto } from "@/models/dtos";

/** SERIES PROFILE **/
export async function getSeriesProfile(): Promise<SeriesDto> {
  const res = await api.get('/series/me');
  return res.data;
} 

export async function updateSeries(data: Partial<SeriesData>) {
  const res = api.put('/series/me', data);
  return res;
} 

/** SERIES GYMS **/
export async function addGymToSeries(gymId: number): Promise<void> {
  const res = await api.put(`/series/me/gyms/${gymId}`);
  return res.data;
} 

export async function getGymsForSeries(): Promise<SimpleGymDto[]> {
  const res = await api.get('/series/me/gyms');
  return res.data;
} 

/** SERIES COMPS **/
export async function addCompetitionToSeries(competitionId: number): Promise<void> {
  const res = await api.put(`/series/me/competitions/${competitionId}`);
  return res.data;
} 

export async function getCompsForSeries(): Promise<SimpleCompetitionDto[]> {
  const res = await api.get('/series/me/competitions');
  return res.data;
} 

/** COMPETITOR GROUPS **/
export async function createCompetitorGroup(data: CreateCompetitorGroupDto): Promise<ResolvedCompetitorGroup> {
  const res = await api.put(`/series/me/competitor-groups`, data);
  return res.data;
} 

export async function getCompetitorGroups(): Promise<ResolvedCompetitorGroup[]> {
  const res = await api.get(`/series/me/competitor-groups`);
  return res.data;
} 

export async function updateCompetitorGroup(groupId: number, data: CompetitorGroupDto): Promise<ResolvedCompetitorGroup>  {
  const res = await api.put(`/series/me/competitor-groups/${groupId}`, data);
  return res.data;
} 