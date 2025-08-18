import React, { createContext, useContext, useState } from 'react';

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
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Finish UI for dashboard', listId: '1', done: false, createdAt: new Date(), priority: 'high', favorite: true, },
    { id: '2', text: 'Send meeting notes', listId: '1', done: true, createdAt: new Date(), priority: 'medium', },
    { id: '3', text: 'Review pull requests', listId: '1', done: false, createdAt: new Date(), priority: 'high', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), },
    { id: '4', text: 'Update documentation', listId: '1', done: false, createdAt: new Date(), priority: 'low', },
  ]);

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
