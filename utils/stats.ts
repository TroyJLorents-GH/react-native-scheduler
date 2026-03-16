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

// --- Analytics helpers ---

export type DailyFocusEntry = {
  date: string;    // YYYY-MM-DD
  minutes: number;
  sessions: number;
};

export async function getDailyFocusBreakdown(days: number): Promise<DailyFocusEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(FOCUS_KEY);
    const list: FocusSessionLog[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    const filtered = list.filter(l => l.endedAt >= cutoff);

    const map = new Map<string, { minutes: number; sessions: number }>();
    // Pre-fill all days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = dateKey(d);
      map.set(key, { minutes: 0, sessions: 0 });
    }

    for (const log of filtered) {
      const key = dateKey(new Date(log.endedAt));
      const existing = map.get(key) || { minutes: 0, sessions: 0 };
      existing.minutes += Math.floor(log.workSec / 60);
      existing.sessions += 1;
      map.set(key, existing);
    }

    return Array.from(map.entries()).map(([date, data]) => ({
      date,
      minutes: data.minutes,
      sessions: data.sessions,
    }));
  } catch {
    return [];
  }
}

export type DailyCompletionEntry = {
  date: string;
  count: number;
};

export async function getDailyCompletions(days: number): Promise<DailyCompletionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(COMPLETE_KEY);
    const list: TaskCompletionLog[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    const filtered = list.filter(l => l.completedAt >= cutoff);

    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      map.set(dateKey(d), 0);
    }

    for (const log of filtered) {
      const key = dateKey(new Date(log.completedAt));
      map.set(key, (map.get(key) || 0) + 1);
    }

    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  } catch {
    return [];
  }
}

export async function getTotalStats(): Promise<{
  totalFocusMin: number;
  totalSessions: number;
  totalCompleted: number;
  avgDailyFocusMin: number;
  avgDailyCompleted: number;
  focusStreak: number;
}> {
  try {
    const focusRaw = await AsyncStorage.getItem(FOCUS_KEY);
    const focusList: FocusSessionLog[] = focusRaw ? JSON.parse(focusRaw) : [];
    const completeRaw = await AsyncStorage.getItem(COMPLETE_KEY);
    const completeList: TaskCompletionLog[] = completeRaw ? JSON.parse(completeRaw) : [];

    const totalFocusSec = focusList.reduce((s, l) => s + (l.workSec || 0), 0);
    const totalFocusMin = Math.floor(totalFocusSec / 60);
    const totalSessions = focusList.length;
    const totalCompleted = completeList.length;

    // Daily averages over last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
    const recentFocus = focusList.filter(l => l.endedAt >= thirtyDaysAgo);
    const recentComplete = completeList.filter(l => l.completedAt >= thirtyDaysAgo);
    const avgDailyFocusMin = recentFocus.length > 0 ? Math.round(recentFocus.reduce((s, l) => s + l.workSec, 0) / 60 / 30) : 0;
    const avgDailyCompleted = recentComplete.length > 0 ? Math.round(recentComplete.length / 30 * 10) / 10 : 0;

    // Focus streak: consecutive days with at least 1 focus session, counting back from today
    const focusDays = new Set(focusList.map(l => dateKey(new Date(l.endedAt))));
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (focusDays.has(dateKey(d))) {
        streak++;
      } else {
        // Allow today to be missing (haven't focused yet today)
        if (i === 0) continue;
        break;
      }
    }

    return { totalFocusMin, totalSessions, totalCompleted, avgDailyFocusMin, avgDailyCompleted, focusStreak: streak };
  } catch {
    return { totalFocusMin: 0, totalSessions: 0, totalCompleted: 0, avgDailyFocusMin: 0, avgDailyCompleted: 0, focusStreak: 0 };
  }
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
