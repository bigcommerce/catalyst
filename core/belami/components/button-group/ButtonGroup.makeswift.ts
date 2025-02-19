import { lazy } from 'react'
import { runtime } from '~/lib/makeswift/runtime'
import {
  Checkbox, Link, List, Number, Select, Shape, Style, TextInput, Color
} from '@makeswift/runtime/controls'


runtime.registerComponent(
  lazy(() => import('./ButtonGroup').then((module) => ({ default: module.ButtonGroup }))),
  {
    type: 'text-box-group',
    label: 'Belami / Text Box Group',
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
                right: Number({ label: 'Right', step: 4, suffix: 'px', defaultValue: 5 }),
                bottom: Number({ label: 'Bottom', step: 4, suffix: 'px', defaultValue: 5 }),
                left: Number({ label: 'Left', step: 4, suffix: 'px', defaultValue: 5 })
              }
            })
          }
        }),
        getItemLabel: (button) => button?.text || 'Text box content'
      }),
      
    }
  }
)
