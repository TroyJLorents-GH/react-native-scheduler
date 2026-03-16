import { Todo } from '../context/TodoContext';

/**
 * Check if a task with a repeat setting should appear on a given date
 */
export function shouldTaskAppearOnDate(task: Todo, targetDate: Date): boolean {
  // Normalize target date
  const normalizedTarget = new Date(targetDate);
  normalizedTarget.setHours(0, 0, 0, 0);
  
  // If no repeat setting or task has no due date, only show on original due date
  if (!task.repeat || task.repeat === 'Never') {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isSameDay(dueDate, normalizedTarget);
  }

  // Task has a repeat setting - check if it should appear on targetDate
  const createdDate = new Date(task.createdAt);
  createdDate.setHours(0, 0, 0, 0);
  
  const startDate = task.dueDate ? new Date(task.dueDate) : createdDate;
  startDate.setHours(0, 0, 0, 0);
  
  // Don't show recurring tasks before their start date
  if (normalizedTarget < startDate) {
    return false;
  }

  switch (task.repeat) {
    case 'Daily':
      // Show every day from the start date onwards
      return true;
      
    case 'Weekdays':
      // Show Monday-Friday (from start date onwards)
      const dayOfWeek = normalizedTarget.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
      
    case 'Weekends':
      // Show Saturday-Sunday (from start date onwards)
      const weekendDay = normalizedTarget.getDay();
      return weekendDay === 0 || weekendDay === 6;
      
    case 'Weekly':
      // Show on same day of week as start date
      return normalizedTarget.getDay() === startDate.getDay();
      
    case 'Biweekly':
      // Show every 2 weeks on same day of week
      const daysDiff = Math.floor((normalizedTarget.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeksDiff = Math.floor(daysDiff / 7);
      return normalizedTarget.getDay() === startDate.getDay() && weeksDiff % 2 === 0;
      
    case 'Monthly':
      // Show on same day of month
      return normalizedTarget.getDate() === startDate.getDate();
      
    case 'Yearly':
      // Show on same day and month
      return normalizedTarget.getDate() === startDate.getDate() && 
             normalizedTarget.getMonth() === startDate.getMonth();
      
    default:
      return false;
  }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Get the date key string for a date (YYYY-MM-DD format)
 */
export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Check if a recurring task is completed for a specific date
 */
export function isTaskCompletedForDate(task: Todo, date: Date): boolean {
  if (!task.repeat || task.repeat === 'Never') {
    // Non-recurring task: just check the done flag
    return task.done;
  }
  
  // Recurring task: check if this date is in completedDates
  const dateKey = getDateKey(date);
  return task.completedDates?.includes(dateKey) ?? false;
}

/**
 * Get all tasks that should appear on a specific date (including recurring)
 */
export function getTasksForDate(todos: Todo[], targetDate: Date): Todo[] {
  const normalizedTarget = new Date(targetDate);
  normalizedTarget.setHours(0, 0, 0, 0);
  
  return todos.filter(task => {
    // Check if task should appear on this date
    if (!shouldTaskAppearOnDate(task, normalizedTarget)) {
      return false;
    }
    
    // For recurring tasks, check if completed for this specific date
    if (task.repeat && task.repeat !== 'Never') {
      return !isTaskCompletedForDate(task, normalizedTarget);
    }
    
    // For non-recurring tasks, check the done flag
    return !task.done;
  });
}

/**
 * Check if a task is due today (considering repeat settings)
 */
export function isTaskDueToday(task: Todo): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return shouldTaskAppearOnDate(task, today);
}

/**
 * Check if a task is overdue (only for non-recurring or first occurrence)
 */
export function isTaskOverdue(task: Todo): boolean {
  if (!task.dueDate || task.done) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  // Recurring tasks are never "overdue" - they just appear on their scheduled days
  if (task.repeat && task.repeat !== 'Never') {
    return false;
  }
  
  return dueDate < today;
}

/**
 * Get tasks due tomorrow (including recurring)
 */
export function getTasksDueTomorrow(todos: Todo[]): Todo[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return getTasksForDate(todos, tomorrow);
}

/**
 * Get all recurring/habit tasks
 */
export function getHabitTasks(todos: Todo[]): Todo[] {
  return todos.filter(t => t.repeat && t.repeat !== 'Never');
}

/**
 * Calculate the current streak for a recurring task.
 * Streak = consecutive scheduled days completed, counting back from yesterday
 * (today is excluded since the day isn't over).
 */
export function getHabitStreak(task: Todo): number {
  if (!task.repeat || task.repeat === 'Never') return 0;
  const completedDates = task.completedDates || [];
  if (completedDates.length === 0) return 0;

  let streak = 0;
  const now = new Date();

  // Check if today is completed (bonus - include it if so)
  const todayKey = getDateKey(now);
  const todayCompleted = completedDates.includes(todayKey);

  // Start checking from yesterday (or today if completed)
  const checkStart = new Date(now);
  if (!todayCompleted) {
    checkStart.setDate(checkStart.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const d = new Date(checkStart);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    // Only count days when the task was scheduled
    if (!shouldTaskAppearOnDate(task, d) && !isTaskCompletedForDate(task, d)) {
      continue; // skip non-scheduled days (don't break streak)
    }

    const key = getDateKey(d);
    if (completedDates.includes(key)) {
      streak++;
    } else if (shouldTaskAppearOnDate(task, d)) {
      // Was scheduled but not completed = streak broken
      break;
    }
  }

  return streak;
}

/**
 * Get the completion rate for a habit over the last N days.
 * Returns a number between 0 and 1.
 */
export function getHabitCompletionRate(task: Todo, days: number): number {
  if (!task.repeat || task.repeat === 'Never') return 0;
  const completedDates = task.completedDates || [];

  let scheduled = 0;
  let completed = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    if (shouldTaskAppearOnDate(task, d)) {
      scheduled++;
      const key = getDateKey(d);
      if (completedDates.includes(key)) {
        completed++;
      }
    }
  }

  return scheduled > 0 ? completed / scheduled : 0;
}

/**
 * Get the last 30 days completion map for a habit (for calendar heatmap).
 * Returns array of { date: string, scheduled: boolean, completed: boolean }.
 */
export function getHabitCalendar(task: Todo, days: number = 30): Array<{ date: string; scheduled: boolean; completed: boolean }> {
  const completedDates = task.completedDates || [];
  const result: Array<{ date: string; scheduled: boolean; completed: boolean }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = getDateKey(d);
    result.push({
      date: key,
      scheduled: shouldTaskAppearOnDate(task, d),
      completed: completedDates.includes(key),
    });
  }

  return result;
}

