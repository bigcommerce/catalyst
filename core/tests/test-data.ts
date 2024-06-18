import { faker } from '@faker-js/faker';

export const testUser = {
  emailAddress: process.env.TEST_ACCOUNT_EMAIL || '',
  password: process.env.TEST_ACCOUNT_PASSWORD || '',
  streetAddress: faker.location.streetAddress(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
  city: faker.location.city(),
  zipCode: '76286',
};
