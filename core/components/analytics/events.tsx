import { createContext, PropsWithChildren, useContext } from 'react';

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
