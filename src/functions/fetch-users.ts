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
