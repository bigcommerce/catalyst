import clsx from 'clsx';

type TextBox = {
  text: string;
  link?: { href: string; target?: '_self' | '_blank' };
  size?: number;
  underline?: boolean;
  color?: string;
  customColor?: string;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
};

type Props = {
  className?: string;

  buttons: TextBox[];
};

export function ButtonGroup({ className, buttons }: Props) {
  const createClasses = (prefix: string, value?: string) => (value ? `${prefix}-${value}` : '');

  return (
    <div
      className={clsx(
        className,

        'inline text-center xl:text-left',
      )}
    >
      {buttons.map((button, i) => (
        <div
          key={i}
          className={clsx(
            // layoutType === 'inline' ? 'inline' : 'flex',
            'inline text-[16px] font-normal leading-[32px] tracking-[0.5px] first:font-bold last:font-bold',
          )}
          style={{
            backgroundColor: button.color || 'transparent',
            margin: `${button.margin?.top || 0}px ${button.margin?.right || 0}px ${button.margin?.bottom || 0}px ${button.margin?.left || 0}px`,
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
            <span
              style={{ color: button.customColor || '#000', fontSize: `${button.size || 16}px` }}
            >
              {button.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
