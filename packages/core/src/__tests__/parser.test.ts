import { parse } from '../parser'

describe('parser', () => {
  describe('parses function params correctly', () => {
    /**
     * export default function foo() {}
     */
    it('parses export default function statement correctly', () => {
      const input = `
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
    const deleteUser = async (userEmail: string, deleteUserFromDb?: boolean) => {}

    export default deleteUser
    `

      const result = parse(input)

      expect(result).toEqual({
        params: [
          {
            identifier: 'userEmail',
            label: 'User email',
            type: 'string',
            required: true,
            meta: {},
          },
          {
            identifier: 'deleteUserFromDb',
            label: 'Delete user from db',
            type: 'boolean',
            required: false,
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
     * export default () => {}
     */
    it('parses anonymous arrow functions correctly', () => {
      const input = `
    export default (
      // eslint-disable-next-line
      id: string,
      // eslint-disable-next-line
      /** @scripterParam Date of Birth */ /** @maxDate now */ date: Date,
      // eslint-disable-next-line
      /** @scripterParam People Height */ /** @minValue 20 */ /** @maxValue 40 */ /** @step 5 */ height?: number,
    ) => {
      return {}
    }
    `

      const result = parse(input)

      expect(result).toEqual({
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

    /*
     * export default function () {}
     */
    it('parses anonymous functions expressions correctly', () => {
      const input = `
    export default function (
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

  describe('parses function meta correctly', () => {
    /**
     * Foo function
     *
     * @scripterTitle: Foo Function
     *
     * export default function foo() {}
     */
    it('parses explicit function title and description from doc correctly from export default function statements', () => {
      const input = `
    /**
     * Completely delete user from the database and inform them on their email
     *
     * @scripterTitle Delete User from Database
     *
     * @param userEmail email of the user
     */
    export default function deleteUser() {}
    `
      const { meta } = parse(input)
      expect(meta?.title).toBe('Delete User from Database')
      expect(meta?.description).toBe('Completely delete user from the database and inform them on their email')
    })

    /**
     * Foo function
     *
     * @scripterTitle: Foo Function
     *
     * function foo() {}
     *
     * export default foo
     */
    it('parses explicit function title and description from doc correctly when function declared and exported separtely', () => {
      const input = `
    /**
     * Completely delete user from the database and inform them on their email
     *
     * @scripterTitle Delete User from Database
     *
     * @param userEmail email of the user
     */
    function deleteUser() {}

    export default deleteUser
    `
      const { meta } = parse(input)
      expect(meta?.title).toBe('Delete User from Database')
      expect(meta?.description).toBe('Completely delete user from the database and inform them on their email')
    })

    /**
     * Foo function
     *
     * @scripterTitle: Foo Function
     *
     * const foo = () => {}
     *
     * export default foo
     */
    it('parses explicit function title and description from doc correctly when declared using a const with arrow function and exported separately', () => {
      const input = `
      /**
       * Completely delete user from the database and inform them on their email
       *
       * @scripterTitle Delete User from Database
       *
       * @param userEmail email of the user
       */
      const deleteUser = () => {}
  
      export default deleteUser
      `
      const { meta } = parse(input)
      expect(meta?.title).toBe('Delete User from Database')
      expect(meta?.description).toBe('Completely delete user from the database and inform them on their email')
    })

    /**
     * Foo function
     *
     * @scripterTitle: Foo Function
     *
     * const foo = function () {}
     *
     * export default foo
     */
    it('parses explicit function title and description from doc correctly when declared using a const with function expression and exported separately', () => {
      const input = `
      /**
       * Completely delete user from the database and inform them on their email
       *
       * @scripterTitle Delete User from Database
       *
       * @param userEmail email of the user
       */
      const deleteUser = function () {}
  
      export default deleteUser
      `
      const { meta } = parse(input)
      expect(meta?.title).toBe('Delete User from Database')
      expect(meta?.description).toBe('Completely delete user from the database and inform them on their email')
    })

    /**
     * Foo function
     *
     * @scripterTitle: Foo Function
     *
     * export default () => {}
     */
    it('parses explicit function title and description from doc correctly for anonymous arrow functions', () => {
      const input = `
      /**
       * Completely delete user from the database and inform them on their email
       *
       * @scripterTitle Delete User from Database
       *
       * @param userEmail email of the user
       */
      export default () => {}
      `
      const { meta } = parse(input)
      expect(meta?.title).toBe('Delete User from Database')
      expect(meta?.description).toBe('Completely delete user from the database and inform them on their email')
    })
  })

  describe('parses complex type definitions correctly', () => {
    it('parses parses type defintions specified using types correctly', () => {
      const input = `
      type Address = {
        addressLine1: string
        addressLine2?: string
        state: string
        country: string
        pincode: number
      }
      
      export default function createUser(
        firstName: string,
        lastName: string,
        email: string,
        address: Address,
        dateOfBirth: Date,
      ) {}
      `

      const { params } = parse(input)
      expect(params[3]).toEqual({
        identifier: 'address',
        label: 'Address',
        required: true,
        type: 'type',
        meta: {},
        children: [
          {
            identifier: 'addressLine1',
            label: 'Address line 1',
            required: true,
            type: 'string',
            meta: {},
          },
          {
            identifier: 'addressLine2',
            label: 'Address line 2',
            required: false,
            type: 'string',
            meta: {},
          },
          {
            identifier: 'state',
            label: 'State',
            required: true,
            type: 'string',
            meta: {},
          },
          {
            identifier: 'country',
            label: 'Country',
            required: true,
            type: 'string',
            meta: {},
          },
          {
            identifier: 'pincode',
            label: 'Pincode',
            required: true,
            type: 'number',
            meta: {
              maxValue: undefined,
              minValue: undefined,
              step: undefined,
            },
          },
        ],
      })
    })

    it('parses type definitions from interfaces correctly', () => {
      const input = `
      interface PhoneNumber {
        extension: number
        phoneNumber: number
      }
      
      export default async function createUser(
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: PhoneNumber,
        dateOfBirth: Date,
      ) {
      }
      `

      const { params } = parse(input)
      expect(params[3]).toEqual({
        identifier: 'phoneNumber',
        label: 'Phone number',
        type: 'type',
        required: true,
        meta: {},
        children: [
          {
            identifier: 'extension',
            label: 'Extension',
            type: 'number',
            required: true,
            meta: {
              minValue: undefined,
              maxValue: undefined,
              step: undefined,
            },
          },
          {
            identifier: 'phoneNumber',
            label: 'Phone number',
            type: 'number',
            required: true,
            meta: {
              minValue: undefined,
              maxValue: undefined,
              step: undefined,
            },
          },
        ],
      })
    })
  })
})
