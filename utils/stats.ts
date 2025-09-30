import AsyncStorage from '@react-native-async-storage/async-storage';

export type FocusSessionLog = {
  id: string;
  title: string;
  source: 'task' | 'focus';
  startedAt: number; // ms epoch
  endedAt: number;   // ms epoch
  workSec: number;   // approximate focused seconds
  taskId?: string;
  listId?: string;
};

export type TaskCompletionLog = {
  id: string;        // task id
  completedAt: number; // ms epoch
  listId?: string;
  priority?: string;
};

const FOCUS_KEY = 'stats.focus.logs.v1';
const COMPLETE_KEY = 'stats.completed.logs.v1';

export async function appendFocusLog(log: FocusSessionLog) {
  try {
    const raw = await AsyncStorage.getItem(FOCUS_KEY);
    const list: FocusSessionLog[] = raw ? JSON.parse(raw) : [];
    list.push(log);
    await AsyncStorage.setItem(FOCUS_KEY, JSON.stringify(list));
  } catch {}
}

export async function appendCompletionLog(log: TaskCompletionLog) {
  try {
    const raw = await AsyncStorage.getItem(COMPLETE_KEY);
    const list: TaskCompletionLog[] = raw ? JSON.parse(raw) : [];
    list.push(log);
    await AsyncStorage.setItem(COMPLETE_KEY, JSON.stringify(list));
  } catch {}
}

export async function getFocusMinutesSince(days: number): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(FOCUS_KEY);
    const list: FocusSessionLog[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    const sec = list.filter(l => l.endedAt >= cutoff).reduce((s, l) => s + (l.workSec || 0), 0);
    return Math.floor(sec / 60);
  } catch { return 0; }
}


