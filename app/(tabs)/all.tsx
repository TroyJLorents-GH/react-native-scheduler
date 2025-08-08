// app/(tabs)/all.tsx
import SmartListScreen from '../../components/SmartListScreen';

export default function AllTab() {
  return (
    <SmartListScreen
      title="All"
      filter={todo => !todo.done}
    />
  );
}
