import axios from 'axios'

export const description = {
  title: 'Fetch people',
  description: 'Fetch people using SWAPI',
}

export default async function fetchPeople(
  id: string,
  /** @scripterParam Date of Birth */ /** @maxDate now */ date: Date,
  /** @scripterParam People Height */ /** @minValue 20 */ /** @maxValue 40 */ /** @step 5 */ height?: number,
) {
  const { data } = await axios.get<{ name?: string; height?: string; mass?: string }>(`/people/${id}`, {
    baseURL: 'https://swapi.dev/api/',
  })
  return data
}
