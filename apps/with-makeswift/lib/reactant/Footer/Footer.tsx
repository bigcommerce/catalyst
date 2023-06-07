import { clsx } from 'clsx';
import { MouseEvent, ReactNode } from 'react';

interface FooterLink {
  text?: string;
  link?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
}

interface FooterGroup {
  heading?: string;
  footerLinks?: FooterLink[];
}

interface Props {
  className?: string;
  footerTextStyles?: string;
  backgroundColor?: string;
  textColor?: string;
  contentWidth: number;
  footerSlot: ReactNode;
  footerGroups: FooterGroup[];
}

export function Footer({
  className,
  footerTextStyles,
  backgroundColor,
  textColor,
  contentWidth,
  footerSlot,
  footerGroups,
}: Props) {
  return (
    <footer
      className={clsx(
        className,
        footerTextStyles,
        'w-full px-6 py-10 sm:flex-row sm:gap-x-8 md:px-10 lg:px-12 lg:py-12',
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div
        className="mx-auto flex flex-col gap-x-6 gap-y-8 md:flex-row md:gap-x-8"
        style={{
          maxWidth: `${contentWidth}px`,
        }}
      >
        <div className="min-w-0 max-w-sm sm:min-w-[384px]">{footerSlot}</div>

        {footerGroups.length > 0 && (
          <div className="-order-1 flex flex-1 flex-col gap-x-6 gap-y-8 sm:flex-row md:order-last md:gap-x-8">
            {footerGroups.map((group, groupIndex) => {
              if (footerGroups.length === 0) {
                return null;
              }

              return (
                <div className="flex-1 text-current" key={groupIndex}>
                  <h2 className="mb-4 font-semibold">{group.heading}</h2>
                  <ul className="space-y-4">
                    {group.footerLinks?.map((footerLink, linkIndex) => {
                      return (
                        <li key={linkIndex}>
                          <a {...footerLink.link} className="block">
                            {footerLink.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
}
