import { icons } from 'lucide-react';

export type IconProps = {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  className?: string;
};

export const Icon = function Icon({ name, color, size, className }: IconProps) {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} strokeWidth={1} className={className} />;
};
