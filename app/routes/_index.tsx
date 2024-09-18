import type { MetaFunction } from '@remix-run/node'
import { useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export function loader() {
  return {}
}

export default function Index() {
  const revalidator = useRevalidator()

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

  return <div />
}
