import { createContext, PropsWithChildren, useContext } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';

interface EventsContext {
  onAddToCart?: (formData?: FormData) => void;
  onRemoveFromCart?: (formData?: FormData) => void;
}

const EventsContext = createContext<EventsContext>({
  onAddToCart: undefined,
  onRemoveFromCart: undefined,
});

export const EventsProvider = ({ children, ...props }: PropsWithChildren<EventsContext>) => {
  return <EventsContext.Provider value={props}>{children}</EventsContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventsContext);

  return context;
};

type StreamableEventHandler<T> = (data: T, formData?: FormData) => void;

interface StreamableEventsProviderProps<T> {
  data: Streamable<T>;
  onAddToCart?: StreamableEventHandler<T>;
  onRemoveFromCart?: StreamableEventHandler<T>;
}

function copyFormData(formData?: FormData) {
  if (!formData) return undefined;

  const copy = new FormData();

  formData.forEach((value, key) => copy.append(key, value));

  return copy;
}

function withData<T>(data: Streamable<T>, handler?: StreamableEventHandler<T>) {
  if (!handler) return undefined;

  return (formData?: FormData) => {
    // Snapshot now: the caller may reuse the FormData before the data resolves.
    const snapshot = copyFormData(formData);

    Promise.resolve(data).then(
      (value) => handler(value, snapshot),
      () => undefined,
    );
  };
}

// Doesn't suspend: suspending would render `children` as a Suspense fallback and remount
// them when the data arrives, wiping their state. Events fired before then are delivered
// once the data resolves.
export function StreamableEventsProvider<T>({
  children,
  data,
  onAddToCart,
  onRemoveFromCart,
}: PropsWithChildren<StreamableEventsProviderProps<T>>) {
  return (
    <EventsProvider
      onAddToCart={withData(data, onAddToCart)}
      onRemoveFromCart={withData(data, onRemoveFromCart)}
    >
      {children}
    </EventsProvider>
  );
}
