import { FileChooser } from '@bigcommerce/components/file-chooser';
import { Label } from '@bigcommerce/components/label';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FileChooser> = {
  component: FileChooser,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    accept: { control: 'text', defaultValue: 'image/png,image/jpeg' },
    variant: { control: 'select', options: ['success', 'error'] },
  },
};

export default meta;

type Story = StoryObj<typeof FileChooser>;

export const Default: Story = {
  args: {
    accept: 'image/png,image/jpeg',
    disabled: false,
  },
  render: (args) => (
    <>
      <Label className="my-2 inline-block" htmlFor="file-chooser">
        File Upload
      </Label>
      <p className="pb-2 text-xs font-normal text-gray-500" id="file-chooser-description">
        Upload a file no larger than 500MB in PNG/JPEG format.
      </p>
      <FileChooser aria-describedby="file-chooser-description" id="file-chooser" {...args} />
    </>
  ),
};
