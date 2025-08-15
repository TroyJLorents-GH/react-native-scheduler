import { Stack } from 'expo-router';

export default function TodoStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />        {/* dashboard */}
      <Stack.Screen name="all" />
      <Stack.Screen name="completed" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="priority" />
      <Stack.Screen name="scheduled" />
      <Stack.Screen name="lists" />
      <Stack.Screen name="new" />
      <Stack.Screen name="details" />
      <Stack.Screen name="list-picker" />
      <Stack.Screen name="test" />
      <Stack.Screen name="list-items" />   {/* list items */}
      <Stack.Screen name="[id]" />         {/* individual todo details */}
    </Stack>
  );
}
