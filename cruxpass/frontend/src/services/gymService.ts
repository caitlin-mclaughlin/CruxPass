import { GymData } from "@/models/domain";
import api from "./apiService";
import { CreateCompetitionDto, CompetitorGroupDto, CreateCompetitorGroupDto, GymResponseDto, SimpleSeriesDto, CompetitionDto, UpdateCompetitionDto, ResolvedCompetitorGroup, GroupMutationsDto, CreatedGroupResult } from "@/models/dtos";

/** GYM PROFILE **/
export async function getGymProfile(): Promise<GymResponseDto> {
  const res = await api.get('/gyms/me');
  return res.data;
} 

export async function updateGym(data: Partial<GymData>): Promise<void>  {
  const res = await api.put("gyms/me", data);
  return;
} 

/** COMPETITIONS **/
export async function createCompetitionForGym(data: CreateCompetitionDto): Promise<number>  {
  const res = await api.post(`/gyms/me/competitions`, data);
  return res.data;
} 

export async function getCompById(competitionId: number): Promise<CompetitionDto>  {
  const res = await api.get(`/gyms/me/competitions/${competitionId}`);
  return res.data;
} 

export async function getCompetitionsForGym(): Promise<CompetitionDto[]> {
  const res = await api.get(`/gyms/me/competitions`);
  return res.data;
} 

export async function updateCompetitionForGym(data: UpdateCompetitionDto): Promise<void>  {
  const res = await api.put(`/gyms/me/competitions/${data.id}`, data);
  return;
} 

/** COMPETITOR GROUPS **/
export async function applyGroupMutations(data: GroupMutationsDto): Promise<CreatedGroupResult[]>  {
  const res = await api.post(`/gyms/me/competitor-groups/mutations`, data);
  return res.data;
} 

export async function createCompetitorGroup(data: CreateCompetitorGroupDto): Promise<ResolvedCompetitorGroup>  {
  const res = await api.post(`/gyms/me/competitor-groups`, data);
  return res.data;
} 

export async function deleteCompetitorGroup(groupId: number): Promise<void>  {
  await api.delete(`/gyms/me/competitor-groups/${groupId}`);
  return;
} 

export async function getCompetitorGroups(): Promise<ResolvedCompetitorGroup[]> {
  const res = await api.get(`/gyms/me/competitor-groups`);
  return res.data;
} 

export async function updateCompetitorGroup(groupId: number, data: CompetitorGroupDto): Promise<ResolvedCompetitorGroup>  {
  const res = await api.put(`/gyms/me/competitor-groups/${groupId}`, data);
  return res.data;
} 

/** SERIES **/
export async function addSeriesToGym(seriesId: number): Promise<void> {
  const res = await api.put(`/gyms/me/series/${seriesId}`);
  return;
} 

export async function getSeriesForGym(): Promise<SimpleSeriesDto[]> {
  const res = await api.get(`/gyms/me/series`);
  return res.data;
} 