import { Button } from '@bigcommerce/components/button';
import {
  Dialog,
  DialogAction,
  DialogCancel,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@bigcommerce/components/dialog';
import type { Meta, StoryObj } from '@storybook/react';
import { X } from 'lucide-react';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const BasicExample: Story = {
  args: {
    children: <Button className="w-fit">Delete Item</Button>,
  },
  render: ({ children }) => (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <div className="flex gap-4 p-6">
            <DialogTitle>Are you sure you want to continue?</DialogTitle>
            <DialogCancel asChild>
              <Button className="ms-auto w-min p-2" type="button" variant="subtle">
                <X />
              </Button>
            </DialogCancel>
          </div>
          <div className="flex flex-col gap-2 p-6 lg:flex-row">
            <DialogAction asChild>
              <Button className="w-full lg:w-fit" variant="primary">
                Yes
              </Button>
            </DialogAction>
            <DialogCancel asChild>
              <Button className="w-full lg:w-fit" variant="subtle">
                Cancel
              </Button>
            </DialogCancel>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  ),
};
