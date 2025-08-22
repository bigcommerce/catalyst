import { TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import {
  NoibuAutomaticHelpCode,
  NoibuRequestHelpCodeButton,
  NoibuRequestHelpCodeLabel,
} from './client';

runtime.registerComponent(NoibuAutomaticHelpCode, {
  type: 'Noibu - Automatic Help Code',
  label: 'Noibu - Automatic Help Code',
  props: {
    style: TextInput({ label: 'Custom style (inline CSS)', defaultValue: '' }),
  },
});

runtime.registerComponent(NoibuRequestHelpCodeButton, {
  type: 'Noibu - Request Help Code Button',
  label: 'Noibu - Request Help Code Button',
  props: {
    text: TextInput({ label: 'Button text', defaultValue: 'Request Help Code' }),
    style: TextInput({ label: 'Custom style (inline CSS)', defaultValue: '' }),
  },
});

runtime.registerComponent(NoibuRequestHelpCodeLabel, {
  type: 'Noibu - Request Help Code Label',
  label: 'Noibu - Request Help Code Label',
  props: {
    style: TextInput({ label: 'Custom style (inline CSS)', defaultValue: '' }),
  },
});
