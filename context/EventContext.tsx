// import React, { createContext, useContext, useState } from 'react';

// // Event type
// export type Event = {
//   id: string;
//   title: string;
//   date: string; // "YYYY-MM-DD"
//   time?: string;
//   description?: string;
// };

// type EventContextType = {
//   events: Event[];
//   addEvent: (event: Event) => void;
// };

// const EventContext = createContext<EventContextType | undefined>(undefined);

// export const useEventContext = () => {
//   const ctx = useContext(EventContext);
//   if (!ctx) throw new Error("useEventContext must be used inside EventProvider");
//   return ctx;
// };

// export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [events, setEvents] = useState<Event[]>([
//     { id: '1', title: 'Doctor Appointment', date: '2025-08-05', time: '09:00', description: 'Checkup' },
//     { id: '2', title: 'Team Meeting', date: '2025-08-05', time: '13:00', description: 'Zoom call' },
//     { id: '3', title: 'Dinner with Alex', date: '2025-08-05', time: '19:00', description: 'Italian place' },
//   ]);
//   const addEvent = (event: Event) => setEvents(prev => [...prev, event]);
//   return (
//     <EventContext.Provider value={{ events, addEvent }}>
//       {children}
//     </EventContext.Provider>
//   );
// };


import React, { createContext, useContext, useState } from 'react';

// Unified Event type
export type Event = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
  category: string;
  reminder: string;
};

type EventContextType = {
  events: Event[];
  addEvent: (event: Event) => void;
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventContext must be used inside EventProvider");
  return ctx;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([
    // ...your initial events
  ]);

  const addEvent = (event: Event) => setEvents(prev => [...prev, event]);

  const editEvent = (event: Event) =>
    setEvents(prev => prev.map(e => (e.id === event.id ? event : e)));

  const deleteEvent = (id: string) =>
    setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <EventContext.Provider value={{ events, addEvent, editEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};
