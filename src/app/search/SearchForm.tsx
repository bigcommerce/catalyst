'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';

interface Props {
  initialTerm?: string;
}

export const SearchForm = ({ initialTerm = '' }: Props) => {
  const [term, setTerm] = useState(initialTerm);
  const router = useRouter();

  const handleSubmit = (e: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
    e.preventDefault();

    startTransition(() => {
      router.push(`/search?term=${term}`);
      router.refresh();
    });
  };

  return (
    <div className="py-10">
      <form action="/search" method="get" onSubmit={handleSubmit}>
        <input
          className="grey-200 mr-4 border-2 px-8 py-3 font-semibold"
          name="term"
          onChange={(e) => setTerm(e.target.value)}
          value={term}
        />
        <button
          className="border-2 border-blue-primary px-8 py-3 font-semibold text-blue-primary"
          type="submit"
        >
          Search
        </button>
      </form>
    </div>
  );
};
