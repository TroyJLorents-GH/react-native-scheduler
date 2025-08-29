import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type PomodoroSettings = {
  enabled: boolean;
  workTime: number;
  workUnit: 'min' | 'hour';
  breakTime: number;
  breakUnit: 'min' | 'hour';
};

export type Todo = {
  id: string;
  text: string;
  listId: string; 
  done: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  dueTime?: Date;
  category?: string;
  favorite?: boolean;
  notes?: string;
  reminder?: string;
  earlyReminder?: string;
  repeat?: string;
  location?: string;
  locationCoords?: string;
  url?: string;
  images?: string[];
  subTasks?: Todo[];
  tags?: string[];
  pomodoro?: PomodoroSettings;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
};

export type TodoContextType = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  addSubTask: (parentId: string, text: string) => void;
  toggleSubTask: (parentId: string, subTaskId: string) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodoContext = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodoContext must be used inside TodoProvider");
  return ctx;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const hasLoadedRef = useRef(false);
  const STORAGE_KEY = 'scheduler.todos.v1';

  // Convert raw object to Todo with Date fields
  const hydrateTodo = (raw: any): Todo => {
    const toDate = (v: any) => (v ? new Date(v) : undefined);
    return {
      ...raw,
      createdAt: toDate(raw.createdAt) ?? new Date(),
      dueDate: toDate(raw.dueDate),
      dueTime: toDate(raw.dueTime),
      subTasks: raw.subTasks ? raw.subTasks.map((s: any) => hydrateTodo(s)) : undefined,
    } as Todo;
  };

  // Load todos on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          setTodos(Array.isArray(arr) ? arr.map(hydrateTodo) : []);
        } else {
          // Seed a couple of example todos on first run
          setTodos([
            { id: '1', text: 'Finish UI for dashboard', listId: '1', done: false, createdAt: new Date(), priority: 'high', favorite: true },
            { id: '2', text: 'Send meeting notes', listId: '1', done: true, createdAt: new Date(), priority: 'medium' },
          ]);
        }
      } catch (e) {
        // If parsing fails, start with empty list
        setTodos([]);
      } finally {
        hasLoadedRef.current = true;
      }
    })();
  }, []);

  // Persist todos when they change
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const replacer = (_: string, value: any) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos, replacer)).catch(() => {});
  }, [todos]);

  const addTodo = (todo: Todo) => setTodos(prev => [...prev, todo]);
  
  const toggleTodo = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  
  const deleteTodo = (id: string) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  const addSubTask = (parentId: string, text: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === parentId) {
        const newSubTask: Todo = {
          id: Date.now().toString(),
          text,
          listId: todo.listId,
          done: false,
          createdAt: new Date(),
        };
        return {
          ...todo,
          subTasks: [...(todo.subTasks || []), newSubTask]
        };
      }
      return todo;
    }));
  };

  const toggleSubTask = (parentId: string, subTaskId: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === parentId && todo.subTasks) {
        return {
          ...todo,
          subTasks: todo.subTasks.map(subTask =>
            subTask.id === subTaskId ? { ...subTask, done: !subTask.done } : subTask
          )
        };
      }
      return todo;
    }));
  };

  const updateTodo = (id: string, patch: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...patch } : todo
    ));
  };

  return (
    <TodoContext.Provider value={{ 
      todos, 
      addTodo, 
      toggleTodo, 
      deleteTodo, 
      addSubTask, 
      toggleSubTask, 
      updateTodo 
    }}>
      {children}
    </TodoContext.Provider>
  );
};
