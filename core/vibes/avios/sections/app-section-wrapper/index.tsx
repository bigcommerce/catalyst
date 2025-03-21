// components/AppSectionWrapper.tsx
interface AppSectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AppSectionWrapper({ children, className = '' }: AppSectionWrapperProps) {
  return (
    <div className={`mx-auto w-full max-w-[1248px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
