import { useEffect } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRevalidator } from '@remix-run/react'
import type { LinksFunction } from '@remix-run/node'
import './globals.css'
import AppShell from './components/app-shell'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap',
  },
]

export async function loader() {
  const { routes } = await import('virtual:scripter/entry')
  return { routes }
}

export function Layout({ children }: { children: React.ReactNode }) {
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppShell routes={routes}>{children}</AppShell>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
