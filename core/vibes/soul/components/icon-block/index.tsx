import { clsx } from 'clsx';

import { Icon, IconProps } from '@/vibes/soul/components/icon';

export interface IconBlockProps {
  list: Array<{
    icon: IconProps['name'];
    title: string;
    description: string;
  }>;
}

export const IconBlock = function IconBlock({ list }: IconBlockProps) {
  return (
    <section className="bg-background text-foreground @container">
      <ul className="mx-auto flex w-full max-w-screen-2xl flex-wrap justify-center divide-y divide-contrast-100 px-3 @2xl:px-20">
        {list.map(({ title, description, icon }, idx) => {
          return (
            <li
              className={clsx(
                'flex flex-col items-center gap-2 px-1 py-10',
                list.length !== 4 ? 'w-full @md:w-1/2 @xl:w-1/3' : 'w-1/4',
                { 'border-t border-contrast-100': idx === 0 },
              )}
              key={idx}
            >
              <Icon name={icon} />

              <div className="flex flex-col items-center text-center">
                <span>{title}</span>
                <span className="opacity-40">{description}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
