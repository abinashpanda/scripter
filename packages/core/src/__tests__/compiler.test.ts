import * as path from 'path'
import { compile } from '../compiler'

const scripterFunctionsDir = path.resolve(__dirname, './__fixtures__/functions')
const buildDir = path.resolve(__dirname, './__fixtures__/build')

describe('compiler', () => {
  it('builds function routes correctly', async () => {
    const result = await compile(scripterFunctionsDir, buildDir)
    expect(result.paths).toEqual([
      {
        type: 'function',
        title: 'Ping',
        path: 'ping',
      },
      {
        type: 'function',
        title: 'Sum',
        path: 'sum',
      },
      {
        type: 'directory',
        title: 'User',
        path: 'user',
        children: [
          {
            type: 'function',
            title: 'Fetch all users',
            path: 'user____fetch-all-users',
          },
          {
            type: 'function',
            title: 'Fetch user by email',
            path: 'user____fetch-user-by-email',
          },
          {
            type: 'directory',
            title: 'Delete',
            path: 'user____delete',
            children: [
              {
                type: 'function',
                title: 'Delete user',
                path: 'user____delete____delete-user',
              },
            ],
          },
        ],
      },
    ])
  })
})
