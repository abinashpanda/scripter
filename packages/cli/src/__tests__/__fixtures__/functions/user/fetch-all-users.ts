import { users } from '../data/users'

/**
 * Fetch all the users from database
 *
 * @param id User id
 * @param date Date of birth
 * @param height Height
 */
export default function fetchAllUsers(
  // eslint-disable-next-line
  id: string,
  // eslint-disable-next-line
  /** @scripterParam Date of Birth */ /** @maxDate now */ date: Date,
  // eslint-disable-next-line
  /** @scripterParam People Height */ /** @minValue 20 */ /** @maxValue 40 */ /** @step 5 */ height?: number,
) {
  return users
}
