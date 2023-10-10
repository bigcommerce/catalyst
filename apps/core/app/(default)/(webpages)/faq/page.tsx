import { PageContent } from '../_components/PageContent';

const mockedContent = 'Here can be answers for all popular questions from your Customers.';

export default function FAQ() {
  return <PageContent content={mockedContent} title="FAQ" />;
}

export const runtime = 'edge';
