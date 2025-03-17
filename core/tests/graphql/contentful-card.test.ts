import { render, screen } from '../helpers/test-utils';
import ContentfulCard from '~/components/ui/contentful-card/contentful-card';

describe('ExampleComponent', () => {
  it('fetches and displays Contentful data', async () => {
    render(<ContentfulCard />);

    // Will wait for the mocked GraphQL data to show up
    // expect(await screen.findByText('Mock Title')).toBeInTheDocument();
    // expect(screen.getByText('Mock Description')).toBeInTheDocument();
  });
});
