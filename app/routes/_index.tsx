import type { MetaFunction } from '@remix-run/node'
import { foo } from '@scripter/core'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export default function Index() {
  return <div>{foo}</div>
}
