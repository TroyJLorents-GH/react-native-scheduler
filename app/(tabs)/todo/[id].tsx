import { router, useLocalSearchParams } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function TodoDetails() {
  const { id, new: isNew } = useLocalSearchParams<{ id?: string; new?: string }>();
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#418cff' }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: '700' }}>{isNew ? 'New Reminder' : 'Details'}</Text>
        <View style={{ width: 48 }} />
      </View>
      {/* TODO: reuse your details form here, or keep using the modal in list screen */}
    </View>
  );
}
