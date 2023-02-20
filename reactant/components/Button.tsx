import { PropsWithChildren } from 'react';

interface ClassName {
  className: string;
}

type ComponentClasses<Union extends string> = Record<Union, ClassName>;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & PropsWithChildren;

type Button = React.FC<ButtonProps> &
  ComponentClasses<'primary' | 'secondary' | 'subtle' | 'iconOnly'> & {
    Icon: { className: string };
  };

export const Button: Button = ({ children, ...props }) => {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
};

// Bind classes to parent
Button.primary = {
  className:
    'px-8 py-3 bg-[#053FB0] text-center text-white font-semibold [&_svg]:inline-block enabled:hover:bg-[#3071EF] focus:outline focus:outline-4 focus:outline-[#053FB0]/20 disabled:bg-[#90A4AE]',
};

Button.secondary = {
  className:
    'px-8 py-3 bg-white text-center text-[#053FB0] font-semibold ring-2 ring-[#053FB0] ring-inset [&_svg]:inline-block enabled:hover:bg-[#3071EF]/10 focus:outline focus:outline-4 focus:outline-[#053FB0]/20 disabled:text-[#90A4AE] disabled:ring-[#90A4AE]',
};

Button.subtle = {
  className:
    'px-8 py-3 bg-white text-center text-[#053FB0] font-semibold [&_svg]:inline-block enabled:hover:bg-[#3071EF]/10 focus:outline focus:outline-4 focus:outline-[#053FB0]/20 disabled:text-[#90A4AE]',
};

Button.iconOnly = {
  className: '!px-3',
};

Button.Icon = {
  className: 'mr-3',
};
