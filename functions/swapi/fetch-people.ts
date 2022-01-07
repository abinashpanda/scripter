import axios from 'axios'

/**
 * Fetch people from the Star Wars API
 */
export default async function fetchPeople(/** @scripterParam People id */ id: string) {
  const { data } = await axios.get(`https://swapi.dev/api/people/${id}`)
  return data
}
