import { Style } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { InlineEmailForm } from '.';

interface MSInlineEmailFormProps {
  className: string;
}

runtime.registerComponent(
  function MSInlineEmailForm({ className }: MSInlineEmailFormProps) {
    return (
      <div className={className}>
        <InlineEmailForm />
      </div>
    );
  },
  {
    type: 'primitive-inline-form',
    label: 'Primitives / Inline Email Form',
    icon: 'form',
    props: {
      className: Style(),
    },
  },
);
