import { useEffect } from 'react'
import { Outlet, useLoaderData, useRevalidator } from '@remix-run/react'
import AppShell from '@/components/app-shell'

export async function loader() {
  const { routes } = await import('virtual:scripter/entry')
  return { routes }
}

export default function ScripterLayout() {
  const revalidator = useRevalidator()
  const { routes } = useLoaderData<typeof loader>()

  useEffect(
    function reloadOnServerMessage() {
      if (import.meta.hot) {
        import.meta.hot.on('reload', () => {
          revalidator.revalidate()
        })
      }
    },
    [revalidator],
  )

  return (
    <AppShell routes={routes}>
      <Outlet />
    </AppShell>
  )
}
