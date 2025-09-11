import { Stack } from 'expo-router';

export default function TodoStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />        {/* dashboard */}
      <Stack.Screen name="all" />
      <Stack.Screen name="completed" />
      {/* todays-tasks moved to app root; keep here for deep links if needed but hidden */}
      <Stack.Screen name="todays-tasks" options={{ headerShown: false }} />
      <Stack.Screen name="priority" />
      <Stack.Screen name="scheduled" />
      <Stack.Screen name="lists" />
      <Stack.Screen name="new" />
      <Stack.Screen name="details" />
      <Stack.Screen name="list-picker" />
      <Stack.Screen name="test" />
      <Stack.Screen name="list-items" />   {/* list items */}
      <Stack.Screen name="task-details" /> {/* task details with pomodoro */}
      <Stack.Screen name="[id]" />         {/* individual todo details */}
    </Stack>
  );
}
