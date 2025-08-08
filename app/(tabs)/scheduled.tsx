// app/(tabs)/scheduled.tsx
import moment from 'moment';
import SmartListScreen from '../../components/SmartListScreen';

export default function ScheduledTab() {
  return (
    <SmartListScreen
      title="Scheduled"
      filter={todo => todo.dueDate && moment(todo.dueDate).isAfter(moment(), 'day')}
    />
  );
}
