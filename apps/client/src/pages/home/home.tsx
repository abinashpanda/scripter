import { getFunctionRoutes } from '@scripter/core'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { fetchFunctionRoutes } from '../../queries/functions'
import { formatRoute } from '../../utils/route'

export default function Home() {
  const { data } = useQuery(['function-routes'], fetchFunctionRoutes)
  const navigate = useNavigate()

  useEffect(
    function redirectUserToFirstRoute() {
      if (data) {
        const functionRoutes = getFunctionRoutes(data)
        if (functionRoutes.length > 0) {
          navigate(`functions/${formatRoute(functionRoutes[0].route)}`, { replace: true })
        }
      }
    },
    [data, navigate],
  )

  return null
}
