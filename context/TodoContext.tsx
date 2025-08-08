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




// import React, { createContext, useContext, useState } from 'react';

// export type Todo = {
//   id: string;
//   text: string;
//   listId: string; 
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

// export type TodoContextType = {
//   todos: Todo[];
//   addTodo: (todo: Todo) => void;
//   toggleTodo: (id: string) => void;
//   deleteTodo: (id: string) => void;
//   addSubTask: (parentId: string, text: string) => void;
//   toggleSubTask: (parentId: string, subTaskId: string) => void;
//   updateTodo: (id: string, patch: Partial<Todo>) => void;
// };



// const TodoContext = createContext<TodoContextType | undefined>(undefined);

// export const useTodoContext = () => {
//   const ctx = useContext(TodoContext);
//   if (!ctx) throw new Error("useTodoContext must be used inside TodoProvider");
//   return ctx;
// };

// export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [todos, setTodos] = useState<Todo[]>([
//     // Example to-do with subtasks:
//     // {
//     //   id: '100',
//     //   text: 'Big Task',
//     //   done: false,
//     //   createdAt: new Date(),
//     //   subTasks: [
//     //     { id: '101', text: 'Subtask 1', done: false, createdAt: new Date() },
//     //     { id: '102', text: 'Subtask 2', done: true, createdAt: new Date() }
//     //   ]
//     // }
//   ]);

//   const addTodo = (todo: Todo) => setTodos(prev => [...prev, todo]);
//   const toggleTodo = (id: string) =>
//     setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
//   const deleteTodo = (id: string) =>
//     setTodos(prev => prev.filter(t => t.id !== id));
//   // in TodoContext
//   const updateTodo = (id: string, patch: Partial<Todo>) =>
//   setTodos(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));


//   // ---- SUBTASK SUPPORT ----
//   const addSubTask = (parentId: string, text: string) =>
//     setTodos(prev => prev.map(todo =>
//       todo.id === parentId
//         ? {
//             ...todo,
//             subTasks: [
//               ...(todo.subTasks || []),
//               {
//                 id: Date.now().toString(),
//                 text,
//                 listId: todo.listId, 
//                 done: false,
//                 createdAt: new Date(),
//               },
//             ],
//           }
//         : todo
//     ));

//   const toggleSubTask = (parentId: string, subTaskId: string) =>
//     setTodos(prev => prev.map(todo =>
//       todo.id === parentId
//         ? {
//             ...todo,
//             subTasks: todo.subTasks?.map(sub =>
//               sub.id === subTaskId ? { ...sub, done: !sub.done } : sub
//             ),
//           }
//         : todo
//     ));

//   return (
//     <TodoContext.Provider value={{ 
//         todos, 
//         addTodo, 
//         toggleTodo, 
//         deleteTodo, 
//         addSubTask, 
//         toggleSubTask,
//         updateTodo,
//          }}>
//       {children}
//     </TodoContext.Provider>
//   );
// };


import React, { createContext, useContext, useMemo, useState } from 'react';

/* =========================
   Types
========================= */

export type Priority = 'high' | 'medium' | 'low';

export type Recurrence = {
  freq: 'daily' | 'weekly' | 'monthly';
  interval?: number; // default 1
};

export type SubTask = {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
};

export type Todo = {
  id: string;
  listId: string;
  text: string;
  done: boolean;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  notes?: string;
  priority: Priority;
  favorite?: boolean;
  category?: string;
  recurrence?: Recurrence;
  subTasks?: SubTask[];
};

export type List = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

export type TodoContextType = {
  todos: Todo[];
  lists: List[];
  listsWithCounts: Array<List & { count: number }>;

  // todo actions
  addTodo: (t: Omit<Todo, 'subTasks' | 'completedAt'> & { subTasks?: SubTask[] }) => void;
  updateTodo: (id: string, patch: Partial<Omit<Todo, 'id' | 'listId' | 'createdAt'>>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;

  // subtask actions
  addSubTask: (todoId: string, text: string) => void;
  toggleSubTask: (todoId: string, subId: string) => void;

  // list actions
  addList: (name: string, color?: string, icon?: string) => string;

  // helpers
  getTodoById: (id: string) => Todo | undefined;
};

/* =========================
   Helpers
========================= */

function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextDue(date: Date, r?: Recurrence) {
  if (!r) return undefined;
  const n = new Date(date);
  const k = r.interval ?? 1;
  if (r.freq === 'daily') n.setDate(n.getDate() + k);
  if (r.freq === 'weekly') n.setDate(n.getDate() + 7 * k);
  if (r.freq === 'monthly') n.setMonth(n.getMonth() + k);
  return n;
}

/* =========================
   Context
========================= */

const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Seed lists
  const [lists, setLists] = useState<List[]>([
    { id: 'inbox', name: 'Inbox' },
    { id: 'health', name: 'Health', color: '#60a5fa', icon: 'heart' },
  ]);

  // Seed todos (empty by default)
  const [todos, setTodos] = useState<Todo[]>([]);

  const getTodoById = (id: string) => todos.find(t => t.id === id);

  const addList = (name: string, color?: string, icon?: string) => {
    const id = uid('list_');
    setLists(prev => [...prev, { id, name, color, icon }]);
    return id;
  };

  const addTodo: TodoContextType['addTodo'] = (t) => {
    // Normalize optional arrays/dates
    const normalized: Todo = {
      ...t,
      subTasks: t.subTasks ?? [],
      completedAt: undefined,
      // Ensure Date objects if they came in as strings
      createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
      dueDate: t.dueDate ? (t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate)) : undefined,
    };
    setTodos(prev => [normalized, ...prev]);
  };

  const updateTodo: TodoContextType['updateTodo'] = (id, patch) => {
    setTodos(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const patched: Todo = {
          ...t,
          ...patch,
        };
        // normalize any possibly string dates in patch
        if (patched.dueDate && !(patched.dueDate instanceof Date)) {
          patched.dueDate = new Date(patched.dueDate);
        }
        if (patched.completedAt && !(patched.completedAt instanceof Date)) {
          patched.completedAt = new Date(patched.completedAt);
        }
        return patched;
      })
    );
  };

  const deleteTodo: TodoContextType['deleteTodo'] = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleTodo: TodoContextType['toggleTodo'] = (id) => {
    const t = getTodoById(id);
    if (!t) return;

    const willBeDone = !t.done;

    // Standard toggle
    setTodos(prev =>
      prev.map(x =>
        x.id === id ? { ...x, done: willBeDone, completedAt: willBeDone ? new Date() : undefined } : x
      )
    );

    // Recurrence roll-forward (Apple Reminders-like)
    if (willBeDone && t.dueDate && t.recurrence) {
      const nd = nextDue(t.dueDate, t.recurrence);
      if (nd) {
        // roll the same task forward
        setTodos(prev =>
          prev.map(x =>
            x.id === id
              ? {
                  ...x,
                  done: false,
                  completedAt: undefined,
                  dueDate: nd,
                }
              : x
          )
        );
      }
    }
  };

  const addSubTask: TodoContextType['addSubTask'] = (todoId, text) => {
    const sub: SubTask = {
      id: uid('sub_'),
      text,
      done: false,
      createdAt: new Date(),
    };
    setTodos(prev =>
      prev.map(t => (t.id === todoId ? { ...t, subTasks: [...(t.subTasks ?? []), sub] } : t))
    );
  };

  const toggleSubTask: TodoContextType['toggleSubTask'] = (todoId, subId) => {
    setTodos(prev =>
      prev.map(t => {
        if (t.id !== todoId) return t;
        const updated = (t.subTasks ?? []).map(s => (s.id === subId ? { ...s, done: !s.done } : s));
        return { ...t, subTasks: updated };
      })
    );
  };

  // Derived: list counts
  const listsWithCounts = useMemo(
    () =>
      lists.map(l => ({
        ...l,
        count: todos.filter(t => t.listId === l.id && !t.done).length,
      })),
    [lists, todos]
  );

  const value: TodoContextType = {
    todos,
    lists,
    listsWithCounts,

    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,

    addSubTask,
    toggleSubTask,

    addList,

    getTodoById,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodoContext = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodoContext must be used within TodoProvider');
  return ctx;
};
