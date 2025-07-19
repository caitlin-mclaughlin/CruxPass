// api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

export const getCompetitionsForGym = (gymId: number) =>
  api.get(`/gyms/${gymId}/competitions`)

export const createCompetition = (gymId: number, data: any) =>
  api.post(`/gyms/${gymId}/competitions`, data)

export const getRegistrationsForCompetition = (gymId: number, compId: number) =>
  api.get(`/gyms/${gymId}/competitions/${compId}/registrations`)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api
