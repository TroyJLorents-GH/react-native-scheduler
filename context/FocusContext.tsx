import { appendFocusLog } from '@/utils/stats';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTodoContext } from './TodoContext';

type SessionSource = 'task' | 'focus';
type Phase = 'idle' | 'work' | 'break' | 'paused';

export type ActiveSession = {
  id: string;
  title: string;
  source: SessionSource;
  workDurationSec: number;    // configured work duration
  breakDurationSec: number;   // configured break duration
  totalSessions: number;      // total number of work sessions
  sessionsLeft: number;       // remaining work sessions
  remainingSec: number;       // current countdown
  phase: Phase;
  pausedPhase?: Phase;        // which phase was active before pause
};

type FocusContextValue = {
  session: ActiveSession | null;
  startTaskSession: (opts: { id: string; title: string; workMinutes: number; breakMinutes?: number; sessions?: number }) => void;
  startFocusSession: (opts: { title: string; workMinutes: number; breakMinutes?: number; sessions?: number }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipToNext: () => void;
};

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { todos } = useTodoContext();
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const logSession = useCallback((s: ActiveSession) => {
    const endedAt = Date.now();
    const workedSec = s.workDurationSec - (s.phase === 'work' ? s.remainingSec : 0);
    const totalWorkedSec = (s.totalSessions - s.sessionsLeft) * s.workDurationSec + (s.phase === 'work' ? s.workDurationSec - s.remainingSec : 0);
    const startedAt = endedAt - totalWorkedSec * 1000;
    const t = todosRef.current.find(x => x.id === s.id);
    appendFocusLog({
      id: s.id,
      title: s.title,
      source: s.source,
      startedAt,
      endedAt,
      workSec: totalWorkedSec,
      taskId: t?.id,
      listId: t?.listId,
    });
  }, []);

  const tick = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      if (prev.phase !== 'work' && prev.phase !== 'break') return prev;

      const next = Math.max(0, prev.remainingSec - 1);

      if (next === 0) {
        if (prev.phase === 'work') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          const remaining = prev.sessionsLeft - 1;

          if (remaining > 0) {
            // Work done, start break
            Alert.alert('Focus Complete!', 'Great work! Time for a break.', [{ text: 'OK' }]);
            return {
              ...prev,
              phase: 'break' as Phase,
              sessionsLeft: remaining,
              remainingSec: prev.breakDurationSec,
            };
          }
          // All sessions complete
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'All Sessions Complete!',
            `You've completed ${prev.totalSessions} focus session${prev.totalSessions > 1 ? 's' : ''}. Well done!`,
            [{ text: 'OK' }]
          );
          // Log and reset
          const endedAt = Date.now();
          const totalWorkedSec = prev.totalSessions * prev.workDurationSec;
          const startedAt = endedAt - totalWorkedSec * 1000;
          const t = todosRef.current.find(x => x.id === prev.id);
          appendFocusLog({
            id: prev.id,
            title: prev.title,
            source: prev.source,
            startedAt,
            endedAt,
            workSec: totalWorkedSec,
            taskId: t?.id,
            listId: t?.listId,
          });
          return {
            ...prev,
            phase: 'idle' as Phase,
            sessionsLeft: prev.totalSessions,
            remainingSec: prev.workDurationSec,
          };
        } else {
          // Break done, start next work session
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Break Over', 'Ready for the next focus session?', [{ text: "Let's Go!" }]);
          return {
            ...prev,
            phase: 'work' as Phase,
            remainingSec: prev.workDurationSec,
          };
        }
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

  const startTaskSession = useCallback(({ id, title, workMinutes, breakMinutes, sessions }: { id: string; title: string; workMinutes: number; breakMinutes?: number; sessions?: number }) => {
    const workSec = Math.max(60, Math.floor(workMinutes * 60));
    const breakSec = Math.max(30, Math.floor((breakMinutes ?? 5) * 60));
    const totalSessions = Math.max(1, sessions ?? 1);
    setSession({
      id,
      title,
      source: 'task',
      workDurationSec: workSec,
      breakDurationSec: breakSec,
      totalSessions,
      sessionsLeft: totalSessions,
      remainingSec: workSec,
      phase: 'work',
    });
  }, []);

  const startFocusSession = useCallback(({ title, workMinutes, breakMinutes, sessions }: { title: string; workMinutes: number; breakMinutes?: number; sessions?: number }) => {
    const workSec = Math.max(60, Math.floor(workMinutes * 60));
    const breakSec = Math.max(30, Math.floor((breakMinutes ?? 5) * 60));
    const totalSessions = Math.max(1, sessions ?? 1);
    setSession({
      id: `focus-${Date.now()}`,
      title,
      source: 'focus',
      workDurationSec: workSec,
      breakDurationSec: breakSec,
      totalSessions,
      sessionsLeft: totalSessions,
      remainingSec: workSec,
      phase: 'work',
    });
  }, []);

  const pause = useCallback(() => {
    setSession(prev => prev && (prev.phase === 'work' || prev.phase === 'break')
      ? { ...prev, phase: 'paused', pausedPhase: prev.phase }
      : prev
    );
  }, []);

  const resume = useCallback(() => {
    setSession(prev => prev && prev.phase === 'paused'
      ? { ...prev, phase: prev.pausedPhase || 'work', pausedPhase: undefined }
      : prev
    );
  }, []);

  const stop = useCallback(() => {
    setSession(prev => {
      if (prev) logSession(prev);
      return null;
    });
  }, [logSession]);

  const skipToNext = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      if (prev.phase === 'work') {
        // Skip remaining work, go to break (or finish if last session)
        const remaining = prev.sessionsLeft - 1;
        if (remaining > 0) {
          return { ...prev, phase: 'break' as Phase, sessionsLeft: remaining, remainingSec: prev.breakDurationSec };
        }
        return { ...prev, phase: 'idle' as Phase, sessionsLeft: prev.totalSessions, remainingSec: prev.workDurationSec };
      }
      if (prev.phase === 'break') {
        return { ...prev, phase: 'work' as Phase, remainingSec: prev.workDurationSec };
      }
      return prev;
    });
  }, []);

  const value: FocusContextValue = {
    session,
    startTaskSession,
    startFocusSession,
    pause,
    resume,
    stop,
    skipToNext,
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
