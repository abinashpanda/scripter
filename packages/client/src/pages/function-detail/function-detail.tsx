import { Empty, Result, Spin } from 'antd'
import { useQuery } from 'react-query'
import { useMatch } from 'react-router-dom'
import Form from '../../components/form'
import { fetchFunctionFromRoute } from '../../queries/functions'

export default function FunctionDetail() {
  const match = useMatch('functions/:route')
  const route = match?.params?.route!

  const { data, isLoading, isError } = useQuery(['function-routes', route], () => fetchFunctionFromRoute(route), {
    enabled: !!route,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin tip="Fetching Function..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Result status="warning" title="Something went wrong" subTitle="Please try again" />
      </div>
    )
  }

  if (data) {
    return (
      <div className="max-w-screen-lg mx-auto space-y-4">
        <div className="p-4 bg-white border rounded-md">
          <div className="text-lg font-medium">{data.title}</div>
          <div className="mb-2">{data.description}</div>
          <hr className="mb-4 -mx-4" />
          <Form params={data.params} />
        </div>
        <div className="p-4 bg-white border rounded-md">
          <Empty description="Run the function to see result" />
        </div>
      </div>
    )
  }

  return null
}
