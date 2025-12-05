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

