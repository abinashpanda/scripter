import { Result, Spin } from 'antd'
import { useQuery } from 'react-query'
import { Route, Routes } from 'react-router-dom'
import { fetchFunctionRoutes } from './queries/functions'
import AppShell from './components/app-shell'
import FunctionDetail from './pages/function-detail'
import Home from './pages/home'

export default function App() {
  const { data, isLoading, isError } = useQuery(['function-routes'], fetchFunctionRoutes)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Spin tip="Bootstrapping..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Result status="warning" title="Something went wrong" subTitle="Please try again" />
      </div>
    )
  }

  if (data) {
    return (
      <AppShell routes={data}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="functions/:route" element={<FunctionDetail />} />
        </Routes>
      </AppShell>
    )
  }

  return null
}
