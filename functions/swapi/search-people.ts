import axios from 'axios'

/**
 * Search people by name from the Star Wars API
 */
export default async function searchPeople(/** @scripterParam Name */ name: string) {
  const { data } = await axios.get('https://swapi.dev/api/people', {
    params: {
      r: name,
    },
  })
  return data.results
}
