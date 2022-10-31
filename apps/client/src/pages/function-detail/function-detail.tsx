import { Result, Spin } from 'antd'
import { AxiosError } from 'axios'
import { useCallback, useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useMatch } from 'react-router-dom'
import Form from '../../components/form'
import { executeFunction, fetchFunctionFromRoute } from '../../queries/functions'
import ExecutionResult from './components/execution-result'

export default function FunctionDetail() {
  const match = useMatch('functions/:route')
  const route = match?.params?.route!

  const { data, isLoading, isError } = useQuery(['function-routes', route], () => fetchFunctionFromRoute(route), {
    enabled: !!route,
  })

  const {
    isLoading: isExecuting,
    data: executionResult,
    mutate: executeFunctionMutation,
    error: executionError,
    reset,
  } = useMutation((data) => executeFunction({ route, data }))

  useEffect(
    function resetExecutionResultOnRouteChange() {
      reset()
    },
    [route, reset],
  )

  const handleSubmit = useCallback(
    (data: any) => {
      executeFunctionMutation(data)
    },
    [executeFunctionMutation],
  )

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
          <Form params={data.params} onSubmit={handleSubmit} submitting={isExecuting} />
        </div>
        <div className="p-4 bg-white border rounded-md" key={route}>
          <ExecutionResult
            key={route}
            functionTitle={data.title}
            isExecuting={isExecuting}
            executionError={executionError as AxiosError<{ message: string; stack: string }>}
            executionResult={executionResult}
          />
        </div>
      </div>
    )
  }

  return null
}
