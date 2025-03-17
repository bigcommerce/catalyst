import { setupServer } from 'msw/node';
import { handlers } from '../graphql/mocks';

export const server = setupServer(...handlers);
