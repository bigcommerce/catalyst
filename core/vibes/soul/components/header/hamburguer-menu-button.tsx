import { clsx } from 'clsx';

export interface HamburgerMenuButtonProps {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  searchOpen: boolean;
}

export const HamburgerMenuButton = function HamburgerMenuButton({
  navOpen,
  setNavOpen,
  searchOpen,
}: HamburgerMenuButtonProps) {
  return (
    <button
      aria-label="Toggle navigation"
      className="group relative rounded-lg p-2 transition-colors @4xl:hidden"
      onClick={() => setNavOpen(!navOpen)}
    >
      <div className="flex h-4 w-4 origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
        <div
          className={clsx(
            'h-px origin-left transform transition-all duration-300',
            navOpen ? 'translate-x-10' : 'w-7',
            searchOpen ? 'bg-contrast-300' : 'bg-foreground',
          )}
        />
        <div
          className={clsx(
            'h-px transform rounded transition-all delay-75 duration-300',
            navOpen ? 'translate-x-10' : 'w-7',
            searchOpen ? 'bg-contrast-300' : 'bg-foreground',
          )}
        />
        <div
          className={clsx(
            'h-px origin-left transform transition-all delay-150 duration-300',
            navOpen ? 'translate-x-10' : 'w-7',
            searchOpen ? 'bg-contrast-300' : 'bg-foreground',
          )}
        />

        <div
          className={clsx(
            'absolute top-2 flex transform items-center justify-between transition-all duration-500',
            navOpen ? 'w-12 translate-x-0' : 'w-0 -translate-x-10',
          )}
        >
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-foreground transition-all delay-300 duration-500',
              navOpen ? 'rotate-45' : 'rotate-0',
            )}
          />
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-foreground transition-all delay-300 duration-500',
              navOpen ? '-rotate-45' : 'rotate-0',
            )}
          />
        </div>
      </div>
    </button>
  );
};
