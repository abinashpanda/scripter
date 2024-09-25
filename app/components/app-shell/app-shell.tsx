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
            className="flex items-center gap-2 truncate rounded-lg p-2 text-sm hover:bg-muted"
          >
            <FunctionSquareIcon className="size-4 text-muted-foreground" />
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
            <Accordion.Header className="flex items-center gap-2 truncate bg-muted p-2 text-sm">
              <PackageIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{moduleRoute.title}</span>
              <Accordion.Trigger className="flex items-center justify-center rounded-md p-0.5 transition-transform hover:bg-background data-[state='open']:rotate-180">
                <ChevronDownIcon className="size-4" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="space-y-2 overflow-hidden p-2 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
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
        <Link to="/" className="flex items-center gap-2">
          <CpuIcon className="size-6" />
          <div className="font-semibold">Scripter</div>
        </Link>
        <Accordion.Root className="flex-1 space-y-2 overflow-auto rounded-xl border p-2" type="multiple">
          {routes.map((route) => renderRoute(route))}
        </Accordion.Root>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
