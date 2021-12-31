import { parse } from './parser'

describe('parser', () => {
  it('parses export default function statement correctly', () => {
    const input = `
    export const description = {
      title: 'Fetch people',
      description: 'Fetch people using SWAPI',
    }
    
    export default async function fetchPeople(
      // eslint-disable-next-line
      id: string,
      // eslint-disable-next-line
      /** @scripterParam Date of Birth */ /** @maxDate now */ date: Date,
      // eslint-disable-next-line
      /** @scripterParam People Height */ /** @minValue 20 */ /** @maxValue 40 */ /** @step 5 */ height?: number,
    ) {
      return {}
    }
    `
    const result = parse(input)

    expect(result).toEqual({
      functionName: 'fetchPeople',
      params: [
        {
          identifier: 'id',
          label: 'Id',
          required: true,
          type: 'string',
          meta: {},
        },
        {
          identifier: 'date',
          label: 'Date of Birth',
          required: true,
          type: 'date',
          meta: {
            maxDate: 'now',
          },
        },
        {
          identifier: 'height',
          label: 'People Height',
          required: false,
          type: 'number',
          meta: {
            minValue: 20,
            maxValue: 40,
            step: 5,
          },
        },
      ],
    })
  })

  it.skip('parses function statements correctly when declared and exported separtely', () => {
    const input = `
    export const description = {
      title: 'Fetch people',
      description: 'Fetch people using SWAPI',
    }
    
    async function fetchUsers(
      // eslint-disable-next-line
      id: string,
      // eslint-disable-next-line
      /** @scripterParam Date of Birth */ /** @maxDate now */ date: Date,
      // eslint-disable-next-line
      /** @scripterParam People Height */ /** @minValue 20 */ /** @maxValue 40 */ /** @step 5 */ height?: number,
    ) {
      return {}
    }
    
    export default fetchUsers
    `

    const result = parse(input)

    expect(result).toEqual({
      functionName: 'fetchUser',
      params: [
        {
          identifier: 'id',
          label: 'Id',
          required: true,
          type: 'string',
          meta: {},
        },
        {
          identifier: 'date',
          label: 'Date of Birth',
          required: true,
          type: 'date',
          meta: {
            maxDate: 'now',
          },
        },
        {
          identifier: 'height',
          label: 'People Height',
          required: false,
          type: 'number',
          meta: {
            minValue: 20,
            maxValue: 40,
            step: 5,
          },
        },
      ],
    })
  })
})
