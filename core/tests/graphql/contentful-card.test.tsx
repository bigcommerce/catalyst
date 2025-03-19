import { render, screen } from '@testing-library/react';
import { ContentfulCard } from '~/components/ui/contentful-card/contentful-card';
import { MockedProvider } from '@apollo/client/testing';
import { useGetCarouselQuery } from '~/contentful/generated/graphql';

jest.mock('~/contentful/generated/graphql', () => ({
  useGetCarouselQuery: jest.fn(),
}));

describe('ContentfulCard', () => {
  it('renders carousel items correctly', async () => {
    // Mock data returned by the GraphQL query
    const mockData = {
      data: {
        carouselCollection: {
          items: [
            {
              sys: { id: '1' },
              title: 'Mock Title 1',
              carouselType: 'Mock Type 1',
            },
            {
              sys: { id: '2' },
              title: 'Mock Title 2',
              carouselType: 'Mock Type 2',
            },
          ],
        },
      },
    };

    // Mock the query result
    useGetCarouselQuery.mockReturnValue(mockData);

    render(
      <MockedProvider>
        <ContentfulCard />
      </MockedProvider>,
    );

    // Test for the presence of the mocked data in the component
    expect(screen.getByText('Mock Title 1')).toBeInTheDocument();
    expect(screen.getByText('Mock Title 2')).toBeInTheDocument();
  });
});
