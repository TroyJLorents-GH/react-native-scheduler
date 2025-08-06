// import React, { createContext, useContext, useState } from 'react';

// export type Todo = {
//   id: string;
//   text: string;
//   done: boolean;
//   createdAt: Date;
//   priority?: 'low' | 'medium' | 'high';
//   dueDate?: Date;
//   category?: string;
//   favorite?: boolean;
//   notes?: string;
//   reminder?: string;
//   subTasks?: Todo[];
//   tags?: string[];
//   recurrence?: {
//     frequency: 'daily' | 'weekly' | 'monthly';
//     interval: number;
//     endDate?: Date;
//   };
// };


// type TodoContextType = {
//   todos: Todo[];
//   addTodo: (todo: Todo) => void;
//   toggleTodo: (id: string) => void;
//   deleteTodo: (id: string) => void;
// };

// const TodoContext = createContext<TodoContextType | undefined>(undefined);

// export const useTodoContext = () => {
//   const ctx = useContext(TodoContext);
//   if (!ctx) throw new Error("useTodoContext must be used inside TodoProvider");
//   return ctx;
// };

// export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [todos, setTodos] = useState<Todo[]>([
//     { id: '1', text: 'Build To-Do List page', done: false, createdAt: new Date() },
//     { id: '2', text: 'Send update to team', done: true, createdAt: new Date() },
//   ]);

//   const addTodo = (todo: Todo) => setTodos(prev => [...prev, todo]);
//   const toggleTodo = (id: string) =>
//     setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
//   const deleteTodo = (id: string) =>
//     setTodos(prev => prev.filter(t => t.id !== id));

//   return (
//     <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
//       {children}
//     </TodoContext.Provider>
//   );
// };




import React, { createContext, useContext, useState } from 'react';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  favorite?: boolean;
  notes?: string;
  reminder?: string;
  subTasks?: Todo[];
  tags?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
};

type TodoContextType = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  addSubTask: (parentId: string, text: string) => void;
  toggleSubTask: (parentId: string, subTaskId: string) => void;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodoContext = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodoContext must be used inside TodoProvider");
  return ctx;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([
    // Example to-do with subtasks:
    // {
    //   id: '100',
    //   text: 'Big Task',
    //   done: false,
    //   createdAt: new Date(),
    //   subTasks: [
    //     { id: '101', text: 'Subtask 1', done: false, createdAt: new Date() },
    //     { id: '102', text: 'Subtask 2', done: true, createdAt: new Date() }
    //   ]
    // }
  ]);

  const addTodo = (todo: Todo) => setTodos(prev => [...prev, todo]);
  const toggleTodo = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id: string) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  // ---- SUBTASK SUPPORT ----
  const addSubTask = (parentId: string, text: string) =>
    setTodos(prev => prev.map(todo =>
      todo.id === parentId
        ? {
            ...todo,
            subTasks: [
              ...(todo.subTasks || []),
              {
                id: Date.now().toString(),
                text,
                done: false,
                createdAt: new Date(),
              },
            ],
          }
        : todo
    ));

  const toggleSubTask = (parentId: string, subTaskId: string) =>
    setTodos(prev => prev.map(todo =>
      todo.id === parentId
        ? {
            ...todo,
            subTasks: todo.subTasks?.map(sub =>
              sub.id === subTaskId ? { ...sub, done: !sub.done } : sub
            ),
          }
        : todo
    ));

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo, addSubTask, toggleSubTask }}>
      {children}
    </TodoContext.Provider>
  );
};
