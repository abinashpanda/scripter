import { Link } from '@remix-run/react'
import { Route as ScripterRoute } from '@scripter/core'
import { FunctionSquareIcon, PackageIcon, CpuIcon, ChevronDownIcon } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'
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
          <Accordion.Item
            value={moduleRoute.route}
            className="divide-y overflow-hidden rounded-lg border text-sm"
            key={moduleRoute.route}
          >
            <Accordion.Header className="bg-muted flex items-center gap-2 truncate p-2 text-sm">
              <PackageIcon className="text-muted-foreground h-4 w-4" />
              <span className="flex-1 truncate">{moduleRoute.title}</span>
              <Accordion.Trigger className="hover:bg-background flex items-center justify-center rounded-md p-0.5 transition-transform data-[state='open']:rotate-180">
                <ChevronDownIcon className="h-4 w-4" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down space-y-2 overflow-hidden p-2 transition-all">
              {moduleRoute.children.map(renderRoute)}
            </Accordion.Content>
          </Accordion.Item>
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
        <Accordion.Root className="flex-1 space-y-2 overflow-auto rounded-xl border p-2" type="multiple">
          {routes.map((route) => renderRoute(route))}
        </Accordion.Root>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
