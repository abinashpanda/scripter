import { Route } from '@scripter/core'
import { apiClient } from '../utils/client'

export async function fetchFunctionRoutes() {
  const { data } = await apiClient.get<Route[]>('/functions/routes')
  return data
}
