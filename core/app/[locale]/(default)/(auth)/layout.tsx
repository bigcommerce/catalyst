import { PropsWithChildren } from 'react';

// MIGRATED: Removed auth check from layout to prevent blocking route errors with Cache Components
// Auth check is now handled in middleware or individual pages as needed
// Layouts accessing async data (like isLoggedIn) cause blocking route errors during prerendering

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}
