import TodoListScreen from '@/components/TodoListScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ListItems() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  return <TodoListScreen listId={String(listId)} />;
}
