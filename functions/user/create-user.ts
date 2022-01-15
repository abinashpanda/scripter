type Address = {
  addressLine1: string
  addressLine2: string
  state: string
  country: string
  pincode: number
}

interface PhoneNumber {
  extension: number
  phoneNumber: number
}

export default async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  address: Address,
  phoneNumber: PhoneNumber,
  dateOfBirth: Date,
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
  }
}
