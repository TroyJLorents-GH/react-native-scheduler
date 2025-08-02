export function getDateString(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
}

export function getDaysAroundToday(numDays: number = 7) {
  const days = [];
  const today = new Date();
  for (let i = -numDays; i <= numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(new Date(d));
  }
  return days;
}
