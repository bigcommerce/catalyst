import { graphql } from 'msw';

export const handlers = [
  graphql.query('ContentfulQueryName', (req, res, ctx) => {
    return res(
      ctx.data({
        ContentfulContent: {
          id: 'mock-id',
          title: 'Mock Title',
          description: 'Mock Description',
        },
      })
    );
  }),
];
