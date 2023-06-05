'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface Props {
  initialTerm?: string;
}

export const SearchForm = ({ initialTerm = '' }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(initialTerm);
  const router = useRouter();

  const status = isPending ? 'pending' : 'idle';

  const handleSubmit = (e: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
    e.preventDefault();

    startTransition(() => {
      router.push(`/search?term=${term}`);
    });
  };

  return (
    <div className="py-10">
      <form action="/search" className="flex" method="get" onSubmit={handleSubmit}>
        <input
          className="grey-200 mr-4 border-2 px-8 py-3 font-semibold"
          name="term"
          onChange={(e) => setTerm(e.target.value)}
          value={term}
        />

        <button
          className="border-2 border-blue-primary px-8 py-3 font-semibold text-blue-primary"
          disabled={status === 'pending'}
          type="submit"
        >
          {status === 'idle' && <span>Search</span>}

          {status === 'pending' && (
            <>
              <Spinner aria-hidden="true" className="animate-spin" />
              <span className="sr-only">Searching...</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
