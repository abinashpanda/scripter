import { parse } from './parser'

describe('parser', () => {
  /**
   * export default function foo() {}
   */
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

  /**
   * function foo() {}
   *
   * export default foo
   */
  it('parses function statements correctly when declared and exported separtely', () => {
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
      functionName: 'fetchUsers',
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

  /**
   * const foo = () => {}
   *
   * export default foo
   */
  it('parses function statement correctly when declared using a const with arrow function and exported separately', () => {
    const input = `
    // eslint-disable-next-line
    const deleteUser = async (userEmail: string) => {}

    export default deleteUser
    `

    const result = parse(input)

    expect(result).toEqual({
      functionName: 'deleteUser',
      params: [
        {
          identifier: 'userEmail',
          label: 'User email',
          type: 'string',
          required: true,
          meta: {},
        },
      ],
    })
  })

  /**
   * const foo = function bar() {}
   *
   * export default foo
   */
  it('parses function statement correctly when declared using a const with function expression and exported separately', () => {
    const input = `
    // eslint-disable-next-line
    const deleteUser = async function (userEmail: string) {}

    export default deleteUser
    `

    const result = parse(input)

    expect(result).toEqual({
      functionName: 'deleteUser',
      params: [
        {
          identifier: 'userEmail',
          label: 'User email',
          type: 'string',
          required: true,
          meta: {},
        },
      ],
    })
  })
})
