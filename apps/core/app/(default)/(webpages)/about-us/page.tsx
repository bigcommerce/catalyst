import { PageContent } from '../_components/PageContent';

const mockedContent =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lobortis elementum lacus. In lectus eros, porta sollicitudin tortor in, eleifend cursus odio. Aliquam porta, velit a pellentesque vehicula, odio massa congue est, sit amet tincidunt sem purus tristique mi. Praesent eget neque nec ligula pharetra lobortis. Etiam ac nibh velit. Nullam sit amet nunc tempus, mattis ex ut, iaculis enim. Integer id pulvinar enim. Curabitur tellus nulla, finibus nec nisi eget, pulvinar rutrum nibh.';

export default function AboutUs() {
  return <PageContent content={mockedContent} title="About Us" />;
}

export const runtime = 'edge';
