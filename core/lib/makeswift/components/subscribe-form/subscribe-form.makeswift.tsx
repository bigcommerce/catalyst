import { Style, TextInput } from '@makeswift/runtime/controls';

import { InlineEmailForm } from '@/vibes/soul/primitives/inline-email-form';
import { runtime } from '~/lib/makeswift/runtime';

interface MSSubscribeFormProps {
  className: string;
  placeholder: string;
}

runtime.registerComponent(
  function SubscribeForm({ className, placeholder }: MSSubscribeFormProps) {
    return (
      <InlineEmailForm
        action={async ({ lastResult, successMessage }, formData) => {
          try {
            const response = await fetch('/api/klaviyo/profile', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { lastResult, successMessage };
          } catch (error) {
            if (error instanceof Error) {
              // eslint-disable-next-line no-console
              console.error('Error fetching customer group data:', error);

              return { lastResult, successMessage: '', errorMessage: error.message };
            }

            return { lastResult, successMessage: '', errorMessage: 'Unknown error' };
          }
        }}
        className={className}
        placeholder={placeholder}
      />
    );
  },
  {
    type: 'subscribe-form',
    label: 'Subscribe Form',
    icon: 'form',
    props: {
      className: Style(),
      placeholder: TextInput({
        defaultValue: 'Enter your email',
        label: 'Placeholder',
        selectAll: true,
      }),
    },
  },
);
