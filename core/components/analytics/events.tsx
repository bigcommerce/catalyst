import { createContext, PropsWithChildren, useContext } from 'react';

interface EventsContext {
  onAddToCart?: (formData?: FormData) => void;
  onRemoveFromCart?: (formData?: FormData) => void;
}

const EventsContext = createContext<EventsContext | null>(null);

export const EventsProvider = ({ children, ...props }: PropsWithChildren<EventsContext>) => {
  return <EventsContext.Provider value={props}>{children}</EventsContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('useEvents must be used within a EventsProvider');
  }

  return context;
};
