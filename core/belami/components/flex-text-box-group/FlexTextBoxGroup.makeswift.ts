import { lazy } from 'react'
import { runtime } from '~/lib/makeswift/runtime'
import { Checkbox, Link, List, Number, Shape, Style, TextInput, Color } from '@makeswift/runtime/controls'

runtime.registerComponent(
  lazy(() => import('./FlexTextBoxGroup').then((module) => ({ default: module.FlexTextBoxGroup }))),
  {
    type: 'flex-box',
    label: 'Belami / Flex Box',
    props: {
      className: Style(),
      buttons: List({
        label: 'Text Boxes',
        type: Shape({
          type: {
            text: TextInput({ label: 'Text', defaultValue: 'Text box content', selectAll: true }),
            link: Link({ label: 'Link' }),
            size: Number({ label: 'Text Size', defaultValue: 16, step: 4, suffix: 'px' }),
            underline: Checkbox({ label: 'Underline', defaultValue: true }),
            customColor: Color({ label: 'Custom Color' }),
            margin: Shape({
              label: 'Margin',
              type: {
                top: Number({ label: 'Top', step: 4, suffix: 'px', defaultValue: 5 }),
                right: Number({ label: 'Right', step: 4, suffix: 'px', defaultValue: 10 }),
                bottom: Number({ label: 'Bottom', step: 4, suffix: 'px', defaultValue: 5 }),
                left: Number({ label: 'Left', step: 4, suffix: 'px', defaultValue: 10 }),
              },
            }),
          },
        }),
        getItemLabel: (button) => button?.text || 'Text box content',
      }),
    },
  }
)
