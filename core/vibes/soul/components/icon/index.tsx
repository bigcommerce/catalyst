import { icons } from 'lucide-react';

export interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  className?: string;
}

export const Icon = function Icon({ name, color, size, className }: IconProps) {
  const LucideIcon = icons[name];

  return <LucideIcon className={className} color={color} size={size} strokeWidth={1} />;
};
