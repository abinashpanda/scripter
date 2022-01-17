type StateInformation = {
  state: string
  country: string
  pincode: number
}

type Address = {
  addressLine1: string
  addressLine2: string
  stateInformation: StateInformation
}

interface PhoneNumber {
  /** @scripterParam Extension (assume + is already added, just enter the extension) */
  extension: number
  phoneNumber: number
}

enum UserType {
  ADMIN = 'ADMIN',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export default async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  address: Address,
  phoneNumber: PhoneNumber,
  dateOfBirth: Date,
  userType: UserType,
) {
  // wait for 1000ms
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // return the data as it is
  return {
    firstName,
    lastName,
    email,
    address,
    phoneNumber,
    dateOfBirth,
    userType,
  }
}
