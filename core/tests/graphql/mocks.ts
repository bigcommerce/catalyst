import { graphql } from 'msw';

export const handlers = [
  graphql.query('YourContentfulQueryName', (req, res, ctx) => {
    return res(
      ctx.data({
        yourContentfulContent: {
          id: 'mock-id',
          title: 'Mock Title',
          description: 'Mock Description',
        },
      })
    );
  }),

  // You can add more mocks for other queries here
];
