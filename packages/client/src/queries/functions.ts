import { FunctionRoute, Route } from '@scripter/core'
import { apiClient } from '../utils/client'

export async function fetchFunctionRoutes() {
  const { data } = await apiClient.get<Route[]>('/functions/routes')
  return data
}

export async function fetchFunctionFromRoute(route: string) {
  const { data } = await apiClient.get<FunctionRoute>(`/functions/routes/${route}`)
  return data
}
