import { notFound } from 'next/navigation';

export default function CatchAllPage() {
  notFound();
}

export const dynamic = 'force-dynamic';

export const experimental_ppr = false;
