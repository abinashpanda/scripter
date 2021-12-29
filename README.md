# scripter

## Getting Started

### Project Structure

```
package.json
package-lock.json
src
  - functions
    - fetch-user-by-email.ts
    - search-users.ts
  - config
    - client.ts
    - server.ts
```

#### Scripts

```
npm start
```

### Writing functions

```ts
/* functions/search-user-by-email.ts */
import axios from 'axios'

export const description = {
  title: 'Fetch User',
  description: 'Fetch user for a corresponding email',
}

export default async function fetchUserByEmail(email: string) {
  const { data } = await axios.get<User>(`/users?email=${email}`)
  if (data) {
    return data[0]
  }
  return undefined
}
```

```ts
/* functions/search-users.ts */
import type { DateRange } from '@scripter/core'

export const description = {
  title: 'Search Users',
  description: 'Search users from database',
}

export default async function searchUsers(
  firstName?: string,
  lastName?: string,
  /** @paramName "Registered during" */ dateRange?: DateRange,
) {
  const { data } = await axios.get<User>(`/users`, {
    params: {
      firstName,
      lastName,
      startDate: dateRange ? dateRange[0].toISOString() : undefined,
      endDate: dateRange ? dateRange[1].toISOString() : undefined,
    },
  })
  return data
}
```
