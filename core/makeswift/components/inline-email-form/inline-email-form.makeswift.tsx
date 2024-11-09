import { Style } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

interface MSInlineEmailFormProps {
  className: string;
}

runtime.registerComponent(
  function MSInlineEmailForm({ className }: MSInlineEmailFormProps) {
    return (
      <div className={className}>
        Inline Form! TODO: Replace
        {/* <InlineEmailForm /> */}
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
