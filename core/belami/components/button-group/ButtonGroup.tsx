import clsx from 'clsx'

type TextBox = {
  text: string
  link?: { href: string; target?: '_self' | '_blank' }
  size?: number
  underline?: boolean
  color?: string
  customColor?: string
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
}

type Props = {
  className?: string
  // layoutType?: 'flex-row' | 'flex-column' | 'inline'
  // justify?: { mobile?: string; tablet?: string; desktop?: string }
  // align?: { mobile?: string; tablet?: string; desktop?: string }
  // rowGap?: number
  // columnGap?: number
  buttons: TextBox[]
}

export function ButtonGroup({
  className,
  buttons,
  // layoutType = 'flex-row',
  // justify = { mobile: 'start', tablet: 'start', desktop: 'start' },
  // align = { mobile: 'start', tablet: 'start', desktop: 'start' },
  // rowGap = 0,
  // columnGap = 0
}: Props) {
  const createClasses = (prefix: string, value?: string) => value ? `${prefix}-${value}` : ''

  return (
    <div
      className={clsx(
        className,
        // layoutType === 'inline' ? 'inline' : 'flex',
        // layoutType === 'flex-column' ? 'flex-col' : 'flex-row',
        // createClasses('justify', justify.mobile),
        // createClasses('items', align.mobile),
        // `sm:${createClasses('justify', justify.tablet)} sm:${createClasses('items', align.tablet)}`,
        // `xl:${createClasses('justify', justify.desktop)} xl:${createClasses('items', align.desktop)}`,
        'text-center xl:text-left inline'
      )}
      // style={{ rowGap, columnGap }}
    >
      {buttons.map((button, i) => (
        <div
          key={i}
          className={clsx(
            // layoutType === 'inline' ? 'inline' : 'flex',
            'inline text-[16px] leading-[32px]  tracking-[0.5px] font-normal first:font-bold last:font-bold'
          )}
          style={{
            backgroundColor: button.color || 'transparent',
            margin: `${button.margin?.top || 0}px ${button.margin?.right || 0}px ${button.margin?.bottom || 0}px ${button.margin?.left || 0}px`
          }}
        >
          {button.link ? (
            <a
              href={button.link.href}
              target={button.link.target || '_self'}
              rel="noopener noreferrer"
              className={clsx('hover:text-blue-700', { underline: button.underline })}
              style={{ color: button.customColor || '#ffffff', fontSize: `${button.size || 16}px` }}
            >
              {button.text}
            </a>
          ) : (
            <span style={{ color: button.customColor || '#000', fontSize: `${button.size || 16}px` }}>
              {button.text}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
