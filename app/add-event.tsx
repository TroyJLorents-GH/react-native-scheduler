import { router } from 'expo-router';
import React from 'react';
import AddEventScreen from '../components/AddEventScreen';
import { useEventContext } from '../context/EventContext';

export default function AddEventPage() {
  const { addEvent } = useEventContext();

  const handleSave = (event: any) => {
    addEvent(event);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <AddEventScreen
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
