import axios from 'axios'
import { QueryClient } from 'react-query'

export const apiClient = axios.create({
  // @TODO: Move it environment variable
  baseURL: 'http://localhost:3000',
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
