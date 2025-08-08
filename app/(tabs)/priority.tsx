import SmartListScreen from '../../components/SmartListScreen';

export default function PriorityTab() {
  return (
    <SmartListScreen
      title="Priority"
      filter={todo => todo.priority === 'high' && !todo.done}
    />
  );
}
