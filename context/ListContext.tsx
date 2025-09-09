import React, { createContext, useContext, useState } from 'react';

export type List = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

type ListContextType = {
  lists: List[];
  addList: (list: Omit<List, 'id'>) => void;
  deleteList: (id: string) => void;
  
};

const ListContext = createContext<ListContextType | undefined>(undefined);

export const useListContext = () => {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error('useListContext must be used inside ListProvider');
  return ctx;
};

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<List[]>([
    { id: '1', name: 'Todo Expo Screen', color: '#418cff', icon: 'list' },
    { id: '2', name: 'Work', color: '#2ecc40', icon: 'briefcase' },
    { id: '3', name: 'Ideas', color: '#ff4136', icon: 'bulb' },
    { id: '4', name: 'Personal', color: '#b10dc9', icon: 'person' },
    { id: 'focus', name: 'Focus', color: '#67c99a', icon: 'timer' },
  ]);

  const addList = (list: Omit<List, 'id'>) => setLists(prev => [
    ...prev,
    { ...list, id: Date.now().toString() }
  ]);

  const deleteList = (id: string) => setLists(prev => prev.filter(l => l.id !== id));

  return (
    <ListContext.Provider value={{ lists, addList, deleteList }}>
      {children}
    </ListContext.Provider>
  );
};
