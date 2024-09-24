import { Link } from '@remix-run/react'
import { Route as ScripterRoute } from '@scripter/core'
import { useCallback } from 'react'
import { match } from 'ts-pattern'

type AppShellProps = React.PropsWithChildren<{
  routes: ScripterRoute[]
}>

export default function AppShell({ routes, children }: AppShellProps) {
  const renderRoute = useCallback((route: ScripterRoute) => {
    return match(route)
      .returnType<React.ReactNode>()
      .with({ type: 'function' }, (functionRoute) => {
        return (
          <Link to={`${functionRoute.route}`} key={route.route} className="flex p-2 text-sm">
            {functionRoute.title}
          </Link>
        )
      })
      .with({ type: 'module' }, (moduleRoute) => {
        return (
          <div className="rounded-md border text-sm" key={moduleRoute.route}>
            <div className="border-b p-2 text-sm">{moduleRoute.title}</div>
            <div className="space-y-2 p-2">{moduleRoute.children.map(renderRoute)}</div>
          </div>
        )
      })
      .otherwise(() => null)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[320px] p-4">
        <div className="h-full space-y-2 overflow-auto rounded-xl border p-2 shadow">
          {routes.map((route) => renderRoute(route))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
