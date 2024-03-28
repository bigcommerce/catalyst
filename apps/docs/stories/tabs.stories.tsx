import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bigcommerce/components/tabs';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

const mockedTabs = ['orders', 'addresses', 'settings'];

export const BasicExample: Story = {
  args: {
    children: 'Tab Content goes here..',
  },
  render: ({ children }) => (
    <Tabs activationMode="manual" defaultValue="settings">
      <TabsList aria-label="Account tabs">
        {mockedTabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="orders">{children}</TabsContent>
      <TabsContent value="addresses">{children}</TabsContent>
      <TabsContent value="settings">{children}</TabsContent>
    </Tabs>
  ),
};
