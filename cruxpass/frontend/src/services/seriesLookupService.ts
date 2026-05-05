import api from './apiService';
import { SimpleSeriesDto } from "@/models/dtos";

export async function getSeriesProfile(seriesId: number): Promise<SimpleSeriesDto> {
  const res = await api.get(`/series/${seriesId}`);
  return res.data;
}

export async function searchSeriesByQuery(query: string): Promise<SimpleSeriesDto[]> {
  const [field, value] = query.split(':', 2)
  const params: Record<string, string> = {}
  if (field && value) {
    params[field.toLowerCase()] = value.trim()
  }

  const res = await api.get(`/series/search`, { params })
  return res.data
}

