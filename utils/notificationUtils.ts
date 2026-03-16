import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request notification permissions */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/** Parse early reminder string to milliseconds offset */
function parseEarlyReminderMs(earlyReminder: string): number {
  switch (earlyReminder) {
    case '5 minutes before': return 5 * 60 * 1000;
    case '15 minutes before': return 15 * 60 * 1000;
    case '30 minutes before': return 30 * 60 * 1000;
    case '1 hour before': return 60 * 60 * 1000;
    case '1 day before': return 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

/**
 * Schedule a local notification for a task.
 * Returns the notification identifier so it can be cancelled later.
 */
export async function scheduleTaskNotification(opts: {
  taskId: string;
  title: string;
  dueDate: Date;
  earlyReminder?: string;
  notes?: string;
}): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Cancel any existing notification for this task
  await cancelTaskNotification(opts.taskId);

  const triggerDate = new Date(opts.dueDate);

  // Apply early reminder offset
  if (opts.earlyReminder && opts.earlyReminder !== 'None') {
    const offsetMs = parseEarlyReminderMs(opts.earlyReminder);
    triggerDate.setTime(triggerDate.getTime() - offsetMs);
  }

  // Don't schedule if the trigger date is in the past
  if (triggerDate.getTime() <= Date.now()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body: opts.notes || 'Task reminder',
      data: { taskId: opts.taskId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
    identifier: `task-${opts.taskId}`,
  });

  return id;
}

/** Cancel a scheduled notification for a task */
export async function cancelTaskNotification(taskId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
  } catch {
    // Notification may not exist, that's fine
  }
}

/** Cancel all scheduled notifications */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Schedule a focus session completion notification */
export async function scheduleFocusNotification(opts: {
  title: string;
  durationSec: number;
}): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Focus Session Complete',
      body: `"${opts.title}" - Great work! Time for a break.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: opts.durationSec,
    },
    identifier: `focus-${Date.now()}`,
  });

  return id;
}
