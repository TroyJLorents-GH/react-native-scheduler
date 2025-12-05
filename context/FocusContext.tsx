import { appendFocusLog } from '@/utils/stats';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTodoContext } from './TodoContext';

type SessionSource = 'task' | 'focus';
type Phase = 'idle' | 'work' | 'break' | 'paused';

export type ActiveSession = {
  id: string;            // todo id or synthetic focus id
  title: string;
  source: SessionSource;
  totalSec: number;
  remainingSec: number;
  phase: Phase;
};

type FocusContextValue = {
  session: ActiveSession | null;
  startTaskSession: (opts: { id: string; title: string; workMinutes: number }) => void;
  startFocusSession: (opts: { title: string; workMinutes: number }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tickOne: () => void; // allow external UIs to stay in sync if needed
};

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { todos } = useTodoContext();
  // Keep todos ref current for stop() without causing re-renders
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const clear = useCallback(() => { 
    if (intervalRef.current) { 
      clearInterval(intervalRef.current); 
      intervalRef.current = null; 
    } 
  }, []);

  const tick = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      if (prev.phase !== 'work' && prev.phase !== 'break') return prev;
      const next = Math.max(0, prev.remainingSec - 1);
      if (next === 0) {
        // Simple cycle: work -> break -> idle
        if (prev.phase === 'work') {
          return { ...prev, phase: 'break', remainingSec: Math.min(5 * 60, prev.totalSec) };
        }
        return { ...prev, phase: 'idle', remainingSec: prev.totalSec };
      }
      return { ...prev, remainingSec: next };
    });
  }, []);

  useEffect(() => {
    clear();
    if (session && (session.phase === 'work' || session.phase === 'break')) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return clear;
  }, [session?.phase, clear, tick]);

  const startTaskSession = useCallback(({ id, title, workMinutes }: { id: string; title: string; workMinutes: number }) => {
    const totalSec = Math.max(60, Math.floor(workMinutes * 60));
    setSession({ id, title, source: 'task', totalSec, remainingSec: totalSec, phase: 'work' });
  }, []);

  const startFocusSession = useCallback(({ title, workMinutes }: { title: string; workMinutes: number }) => {
    const totalSec = Math.max(60, Math.floor(workMinutes * 60));
    setSession({ id: `focus-${Date.now()}`, title, source: 'focus', totalSec, remainingSec: totalSec, phase: 'work' });
  }, []);

  const pause = useCallback(() => {
    setSession(prev => prev ? { ...prev, phase: 'paused' } : prev);
  }, []);

  const resume = useCallback(() => {
    setSession(prev => prev ? { ...prev, phase: 'work' } : prev);
  }, []);

  const stop = useCallback(() => {
    setSession(prev => {
      if (prev) {
        const endedAt = Date.now();
        const startedAt = endedAt - (prev.totalSec - prev.remainingSec) * 1000;
        const t = todosRef.current.find(x => x.id === prev.id);
        appendFocusLog({ id: prev.id, title: prev.title, source: prev.source, startedAt, endedAt, workSec: prev.totalSec - prev.remainingSec, taskId: t?.id, listId: t?.listId });
      }
      return null;
    });
  }, []);

  // Memoize context value with stable function references
  const value: FocusContextValue = {
    session,
    startTaskSession,
    startFocusSession,
    pause,
    resume,
    stop,
    tickOne: tick,
  };

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
};

export const useFocusContext = (): FocusContextValue => {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocusContext must be used within FocusProvider');
  return ctx;
};


