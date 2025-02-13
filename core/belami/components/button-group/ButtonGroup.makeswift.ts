import { lazy } from 'react'
import { runtime } from '~/lib/makeswift/runtime'
import {
  Checkbox, Link, List, Number, Select, Shape, Style, TextInput, Color
} from '@makeswift/runtime/controls'

const justifyOptions = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
  { value: 'between', label: 'Space Between' },
  { value: 'around', label: 'Space Around' },
  { value: 'evenly', label: 'Space Evenly' }
]

const alignOptions = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' }
]

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
      // layoutType: Select({
      //   label: 'Layout Type',
      //   options: [
      //     { value: 'flex-row', label: 'Flex Row' },
      //     { value: 'flex-column', label: 'Flex Column' },
      //     { value: 'inline', label: 'Inline' }
      //   ],
      //   defaultValue: 'inline'
      // }),
      // justify: Shape({
      //   label: 'Justify',
      //   type: {
      //     mobile: Select({ label: 'Mobile', options: justifyOptions, defaultValue: 'start' }),
      //     tablet: Select({ label: 'Tablet', options: justifyOptions, defaultValue: 'start' }),
      //     desktop: Select({ label: 'Desktop', options: justifyOptions, defaultValue: 'start' })
      //   }
      // }),
      // align: Shape({
      //   label: 'Align',
      //   type: {
      //     mobile: Select({ label: 'Mobile', options: alignOptions, defaultValue: 'start' }),
      //     tablet: Select({ label: 'Tablet', options: alignOptions, defaultValue: 'start' }),
      //     desktop: Select({ label: 'Desktop', options: alignOptions, defaultValue: 'start' })
      //   }
      // }),
      // rowGap: Number({ label: 'Row Gap', defaultValue: 0, step: 4, suffix: 'px' }),
      // columnGap: Number({ label: 'Column Gap', defaultValue: 0, step: 4, suffix: 'px' })
    }
  }
)
