import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export type EventType = {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
  category: string;
  reminder: string;
};

type Props = {
  onSave: (event: EventType) => void;
  onCancel: () => void;
  event?: EventType;
};

export default function AddEventScreen({ onSave, onCancel, event }: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [startDate, setStartDate] = useState(event?.startDate ?? new Date());
  const [endDate, setEndDate] = useState(event?.endDate ?? new Date());
  const [description, setDescription] = useState(event?.description ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [category, setCategory] = useState(event?.category ?? '');
  const [reminder, setReminder] = useState(event?.reminder ?? '');

  const [pickerMode, setPickerMode] = useState<null | 'date' | 'time'>(null);
  const [which, setWhich] = useState<'start' | 'end'>('start');

  const fmtDate = (date: Date) => date.toLocaleDateString();
  const fmtTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleConfirm = (selected: Date) => {
    if (pickerMode === 'date') {
      if (which === 'start') setStartDate(new Date(
        selected.getFullYear(), selected.getMonth(), selected.getDate(),
        startDate.getHours(), startDate.getMinutes()
      ));
      else setEndDate(new Date(
        selected.getFullYear(), selected.getMonth(), selected.getDate(),
        endDate.getHours(), endDate.getMinutes()
      ));
    } else if (pickerMode === 'time') {
      if (which === 'start') setStartDate(new Date(
        startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),
        selected.getHours(), selected.getMinutes()
      ));
      else setEndDate(new Date(
        endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),
        selected.getHours(), selected.getMinutes()
      ));
    }
    setPickerMode(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.header}>{event ? 'Edit Event' : 'Add Event'}</Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Start</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('date'); }}>
              <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('time'); }}>
              <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>End</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('date'); }}>
              <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('time'); }}>
              <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Event description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Event location"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Work, Personal"
            value={category}
            onChangeText={setCategory}
          />

          <Text style={styles.label}>Reminder</Text>
          <TextInput
            style={[styles.input, styles.reminderInput]}
            placeholder="e.g., 10 min before"
            value={reminder}
            onChangeText={setReminder}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2d6cdf' }]}
              onPress={() => {
                onSave({
                  title,
                  startDate,
                  endDate,
                  description,
                  location,
                  category,
                  reminder,
                });
              }}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </View>

        <DateTimePickerModal
          isVisible={pickerMode !== null}
          mode={pickerMode || 'date'}
          date={which === 'start' ? startDate : endDate}
          onConfirm={handleConfirm}
          onCancel={() => setPickerMode(null)}
          display="spinner"
          minuteInterval={1}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 22,
    width: '92%',
    maxWidth: 420,
    maxHeight: 530,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 7,
    overflow: 'hidden',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2d6cdf',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
    fontSize: 15,
    marginTop: 2,
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    marginVertical: 7,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    borderRadius: 7,
    backgroundColor: '#f5f6fa',
    width: '100%',
  },
  reminderInput: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dateButton: {
    padding: 8,
    backgroundColor: '#e6e8f0',
    borderRadius: 7,
    marginVertical: 8,
    flex: 1,
    marginRight: 7,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2d6cdf',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 8,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#eee',
    minWidth: 90,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2d6cdf',
    marginTop: 2,
  },
});
