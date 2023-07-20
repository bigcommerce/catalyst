import { BreadcrumbDivider, BreadcrumbItem, Breadcrumbs } from '@bigcommerce/reactant/Breadcrumbs';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronRight } from 'lucide-react';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

const mockedCategories = {
  data: {
    site: {
      category: {
        breadcrumbs: {
          edges: [
            {
              node: {
                name: 'Home',
                path: '/',
              },
            },
            {
              node: {
                name: 'Kitchen',
                path: '/kitchen',
              },
            },
            {
              node: {
                name: 'Subcategory',
                path: '',
              },
            },
          ],
        },
      },
    },
  },
};

export const Example: Story = {
  render: () => (
    <Breadcrumbs>
      {mockedCategories.data.site.category.breadcrumbs.edges
        .map((item) => item.node)
        .map(({ name, path }, index, arr) => {
          return arr.length - 1 === index ? (
            <BreadcrumbItem href={path} isActive key={name}>
              {name}
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem href={path} key={name}>
                {name}
              </BreadcrumbItem>
              <BreadcrumbDivider>
                <ChevronRight aria-hidden="true" size={16} />
              </BreadcrumbDivider>
            </>
          );
        })}
    </Breadcrumbs>
  ),
};
