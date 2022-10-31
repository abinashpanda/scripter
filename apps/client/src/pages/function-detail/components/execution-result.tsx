import type { AxiosError } from 'axios'
import { Spin, Result, Empty } from 'antd'
import clsx from 'clsx'

type ExecutionResultProps = {
  functionTitle: string
  isExecuting?: boolean
  executionError?: AxiosError<{ message: string; stack: string }>
  executionResult?: any
  className?: string
  style?: React.CSSProperties
}

export default function ExecutionResult({
  functionTitle,
  isExecuting,
  executionError,
  executionResult,
  className,
  style,
}: ExecutionResultProps) {
  if (isExecuting) {
    return (
      <div className={clsx('flex items-center justify-center', className)} style={style}>
        <Spin tip={`Executing ${functionTitle}`} />
      </div>
    )
  }

  if (executionError) {
    const { response } = executionError as AxiosError<{ message: string; stack: string }>
    const data = response?.data
    if (data) {
      return (
        <div className={className} style={style}>
          <div className="mb-2 font-medium">Error</div>
          <code className="block mb-2 font-mono text-red-500">{data.message}</code>
          <pre className="p-4 mb-0 font-mono text-white bg-gray-800 rounded-md">
            <code>{data.stack}</code>
          </pre>
        </div>
      )
    }

    return <Result status="warning" title="Something went wrong" subTitle="Please try again" className={className} />
  }

  if (executionResult) {
    return (
      <div className={className} style={style}>
        <div className="mb-2 font-medium">Output</div>
        <pre className="p-4 mb-0 font-mono text-white bg-gray-800 rounded-md">
          <code>{JSON.stringify(executionResult, null, 2)}</code>
        </pre>
      </div>
    )
  }

  return <Empty description="Run the function to see result" className={className} />
}
