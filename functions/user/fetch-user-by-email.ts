import { users } from '../data/users'

export default (email: string) => {
  const user = users.find((_user) => _user.email === email)
  if (user) {
    return user
  }
  throw new Error(`No user with ${email} found`)
}
