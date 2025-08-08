// app/(tabs)/completed.tsx
import SmartListScreen from '../../components/SmartListScreen';

export default function CompletedTab() {
  return (
    <SmartListScreen
      title="Completed"
      filter={todo => todo.done}
    />
  );
}
