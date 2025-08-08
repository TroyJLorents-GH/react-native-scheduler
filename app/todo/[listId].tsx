// app/todo/[listId].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import TodoListScreen from '../../components/TodoListScreen';

export default function ListTodos() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  if (!listId) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'List' }} />
      <TodoListScreen listId={String(listId)} />
    </>
  );
}
