import { Link } from '@remix-run/react'
import { Route as ScripterRoute } from '@scripter/core'
import { FunctionSquareIcon, PackageIcon, CpuIcon } from 'lucide-react'
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
          <Link
            to={`${functionRoute.route}`}
            key={route.route}
            className="hover:bg-muted flex items-center gap-2 truncate rounded-lg p-2 text-sm"
          >
            <FunctionSquareIcon className="text-muted-foreground h-4 w-4" />
            <span className="flex-1 truncate">{functionRoute.title}</span>
          </Link>
        )
      })
      .with({ type: 'module' }, (moduleRoute) => {
        return (
          <div className="overflow-hidden rounded-lg border text-sm" key={moduleRoute.route}>
            <div className="bg-muted flex items-center gap-2 truncate border-b p-2 text-sm">
              <PackageIcon className="text-muted-foreground h-4 w-4" />
              <span className="flex-1 truncate">{moduleRoute.title}</span>
            </div>
            <div className="space-y-2 p-2">{moduleRoute.children.map(renderRoute)}</div>
          </div>
        )
      })
      .otherwise(() => null)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-[320px] flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <CpuIcon className="h-6 w-6" />
          <div className="font-semibold">Scripter</div>
        </div>
        <div className="flex-1 space-y-2 overflow-auto rounded-xl border p-2">
          {routes.map((route) => renderRoute(route))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
