import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { match } from 'ts-pattern'

export async function loader({ params }: LoaderFunctionArgs) {
  const { allRoutes } = await import('virtual:scripter/entry')
  const routeName = params['*']
  if (!routeName || !(routeName in allRoutes)) {
    throw redirect('/not-found')
  }
  const route = allRoutes[routeName]
  return { routeName, route }
}

export default function ScripterFunction() {
  const { route } = useLoaderData<typeof loader>()

  return match(route)
    .returnType<React.ReactNode>()
    .with({ type: 'function' }, (functionRoute) => {
      return (
        <div>
          <div className="space-y-1">
            <div className="text-xl font-medium">{functionRoute.title}</div>
            {functionRoute.description ? (
              <div className="text-sm text-muted-foreground">{functionRoute.description}</div>
            ) : null}
          </div>
        </div>
      )
    })
    .otherwise(() => null)
}
