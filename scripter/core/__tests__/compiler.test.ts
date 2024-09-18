import * as path from 'path'
import * as fs from 'fs/promises'
import { compile } from '../compiler'
import { describe, afterEach, it, expect } from 'vitest'
import { users } from './__fixtures__/functions/data/users'

const scripterFunctionsDir = path.resolve(__dirname, './__fixtures__/functions')
const buildDir = path.resolve(__dirname, './__fixtures__/build')

describe('compiler', () => {
  afterEach(async function deleteBuildOutput() {
    await fs.rm(buildDir, { recursive: true })
  })

  it('builds function routes correctly', async () => {
    const result = await compile(scripterFunctionsDir, buildDir)
    const { routes } = result

    expect(routes).toEqual([
      {
        type: 'function',
        title: 'Ping',
        route: 'ping',
        description: undefined,
        params: [
          {
            identifier: 'name',
            label: 'Name',
            meta: {},
            required: true,
            type: 'string',
          },
        ],
      },
      {
        type: 'function',
        title: 'Sum',
        route: 'sum',
        description: undefined,
        params: [
          {
            identifier: 'first',
            label: 'First',
            meta: {
              maxValue: undefined,
              minValue: undefined,
              step: undefined,
            },
            required: true,
            type: 'number',
          },
          {
            identifier: 'second',
            label: 'Second',
            meta: {
              maxValue: undefined,
              minValue: undefined,
              step: undefined,
            },
            required: true,
            type: 'number',
          },
        ],
      },
      {
        type: 'module',
        title: 'User',
        route: 'user',
        children: [
          {
            type: 'function',
            title: 'Fetch all users',
            route: 'user/fetch-all-users',
            description: undefined,
            params: [
              {
                identifier: 'id',
                label: 'Id',
                meta: {},
                required: true,
                type: 'string',
              },
              {
                identifier: 'date',
                label: 'Date of Birth',
                meta: {
                  maxDate: 'now',
                  minDate: undefined,
                },
                required: true,
                type: 'date',
              },
              {
                identifier: 'height',
                label: 'People Height',
                meta: {
                  maxValue: 40,
                  minValue: 20,
                  step: 5,
                },
                required: false,
                type: 'number',
              },
            ],
          },
          {
            type: 'function',
            title: 'Fetch user by email',
            route: 'user/fetch-user-by-email',
            description: undefined,
            params: [
              {
                identifier: 'email',
                label: 'Email',
                meta: {},
                required: true,
                type: 'string',
              },
            ],
          },
          {
            type: 'module',
            title: 'Delete',
            route: 'user/delete',
            children: [
              {
                type: 'function',
                title: 'Delete User from Database',
                description: 'Completely delete user from the database and inform them on their email',
                route: 'user/delete/delete-user',
                params: [
                  {
                    identifier: 'userEmail',
                    label: 'User email',
                    meta: {},
                    required: true,
                    type: 'string',
                  },
                  {
                    identifier: 'deleteUserFromDb',
                    label: ': Permanently delete user',
                    meta: {},
                    required: false,
                    type: 'boolean',
                  },
                ],
              },
            ],
          },
        ],
      },
    ])

    // check build file is present in the outdir
    const buildOutput = await fs.readdir(buildDir)
    expect(buildOutput).toEqual(['index.js'])
  })

  it('compiles the function correctly', async () => {
    await compile(scripterFunctionsDir, buildDir)
    const routes = await import(buildDir)
    expect(routes.functions).toBeTypeOf('object')

    expect(routes.functions).toHaveProperty('ping')
    const pingResult = routes.functions.ping('pong')
    expect(pingResult).toBe('pong pong')

    expect(routes.functions).toHaveProperty('sum')
    const sumResult = routes.functions.sum(1, 2)
    expect(sumResult).toBe(3)

    expect(routes.functions).toHaveProperty('user_fetch_all_users')
    const fetchUsersResult = routes.functions.user_fetch_all_users('1', new Date(), 25)
    expect(fetchUsersResult).toEqual(users)
  })
})
