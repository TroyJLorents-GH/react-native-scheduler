import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

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

  const clear = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };

  const tick = () => {
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
  };

  useEffect(() => {
    clear();
    if (session && (session.phase === 'work' || session.phase === 'break')) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return clear;
  }, [session?.phase]);

  const start = (id: string, title: string, workMinutes: number, source: SessionSource) => {
    const totalSec = Math.max(60, Math.floor(workMinutes * 60));
    setSession({ id, title, source, totalSec, remainingSec: totalSec, phase: 'work' });
  };

  const value = useMemo<FocusContextValue>(() => ({
    session,
    startTaskSession: ({ id, title, workMinutes }) => start(id, title, workMinutes, 'task'),
    startFocusSession: ({ title, workMinutes }) => start(`focus-${Date.now()}`, title, workMinutes, 'focus'),
    pause: () => setSession(prev => prev ? { ...prev, phase: 'paused' } : prev),
    resume: () => setSession(prev => prev ? { ...prev, phase: 'work' } : prev),
    stop: () => setSession(null),
    tickOne: () => tick(),
  }), [session]);

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
};

export const useFocusContext = (): FocusContextValue => {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocusContext must be used within FocusProvider');
  return ctx;
};


