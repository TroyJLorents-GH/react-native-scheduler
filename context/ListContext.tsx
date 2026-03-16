import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
  updateList: (id: string, patch: Partial<Omit<List, 'id'>>) => void;
};

const STORAGE_KEY = 'scheduler.lists.v1';

const DEFAULT_LISTS: List[] = [
  { id: '1', name: 'Todo Expo Screen', color: '#418cff', icon: 'list' },
  { id: '2', name: 'Work', color: '#2ecc40', icon: 'briefcase' },
  { id: '3', name: 'Ideas', color: '#ff4136', icon: 'bulb' },
  { id: '4', name: 'Personal', color: '#b10dc9', icon: 'person' },
  { id: 'focus', name: 'Focus', color: '#67c99a', icon: 'timer' },
];

const ListContext = createContext<ListContextType | undefined>(undefined);

export const useListContext = () => {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error('useListContext must be used inside ListProvider');
  return ctx;
};

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<List[]>(DEFAULT_LISTS);
  const hasLoadedRef = useRef(false);

  // Load lists from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLists(parsed);
          }
        }
      } catch {}
      hasLoadedRef.current = true;
    })();
  }, []);

  // Persist lists when they change
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists)).catch(() => {});
  }, [lists]);

  const addList = useCallback((list: Omit<List, 'id'>) => {
    setLists(prev => [...prev, { ...list, id: Date.now().toString() }]);
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateList = useCallback((id: string, patch: Partial<Omit<List, 'id'>>) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }, []);

  return (
    <ListContext.Provider value={{ lists, addList, deleteList, updateList }}>
      {children}
    </ListContext.Provider>
  );
};
