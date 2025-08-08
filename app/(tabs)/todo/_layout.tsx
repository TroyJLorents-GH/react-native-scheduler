import { Stack } from 'expo-router';

export default function TodoStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />        {/* dashboard */}
      <Stack.Screen name="lists" />
      <Stack.Screen name="list/[listId]" />
      <Stack.Screen name="[id]" />         {/* details */}
    </Stack>
  );
}
