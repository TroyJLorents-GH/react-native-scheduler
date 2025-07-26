import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { useEffect, useState } from 'react';
import { Alert, Picker, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Helper for supported recurrences
const RECURRENCE_OPTIONS = [
  { label: 'None', value: null },
  { label: 'Daily', value: Calendar.Frequency.DAILY },
  { label: 'Weekly', value: Calendar.Frequency.WEEKLY },
  { label: 'Monthly', value: Calendar.Frequency.MONTHLY },
];

const REMINDER_OPTIONS = [
  { label: 'None', value: null },
  { label: '5 minutes before', value: -5 },
  { label: '15 minutes before', value: -15 },
  { label: '1 hour before', value: -60 },
];

export default function AddEventScreen({ navigation }) {
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [duration, setDuration] = useState('60'); // in minutes
  const [recurrence, setRecurrence] = useState(null);
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        setCalendars(cals);
        if (cals.length) setSelectedCalendarId(cals[0].id);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your event.');
      return;
    }
    if (!selectedCalendarId) {
      Alert.alert('No Calendar', 'Please select a calendar.');
      return;
    }
    const startDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    );
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 1000);

    try {
      await Calendar.createEventAsync(selectedCalendarId, {
        title,
        startDate: startDateTime,
        endDate: endDateTime,
        timeZone: 'America/Phoenix', // update as needed
        notes: 'Created from Scheduler app',
        recurrenceRule: recurrence
          ? {
              frequency: recurrence,
              interval: 1,
              // Add an optional endDate for recurrence if you want
            }
          : undefined,
        alarms: reminder
          ? [{ relativeOffset: reminder }]
          : undefined,
      });
      Alert.alert('Success', 'Event created in your calendar!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not create event.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Event</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={title}
        onChangeText={setTitle}
      />

      {/* Calendar selection */}
      <Text style={styles.label}>Choose Calendar:</Text>
      <View style={styles.calendarList}>
        {calendars.map(cal => (
          <TouchableOpacity
            key={cal.id}
            style={[
              styles.calendarItem,
              selectedCalendarId === cal.id && styles.calendarItemSelected,
            ]}
            onPress={() => setSelectedCalendarId(cal.id)}
          >
            <Text style={styles.calName}>{cal.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date picker */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowDate(true)}
      >
        <Text style={styles.pickerText}>Date: {date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowDate(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {/* Time picker */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowStartTime(true)}
      >
        <Text style={styles.pickerText}>
          Start Time: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
      {showStartTime && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowStartTime(false);
            if (selected) setStartTime(selected);
          }}
        />
      )}

      {/* Duration */}
      <Text style={styles.label}>Duration (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={duration}
        onChangeText={setDuration}
      />

      {/* Recurrence dropdown */}
      <Text style={styles.label}>Repeat:</Text>
      <View style={styles.pickerButton}>
        <Picker
          selectedValue={recurrence}
          style={{ height: 40 }}
          onValueChange={(value) => setRecurrence(value)}
        >
          {RECURRENCE_OPTIONS.map(option => (
            <Picker.Item key={option.label} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      {/* Reminder dropdown */}
      <Text style={styles.label}>Reminder:</Text>
      <View style={styles.pickerButton}>
        <Picker
          selectedValue={reminder}
          style={{ height: 40 }}
          onValueChange={(value) => setReminder(value)}
        >
          {REMINDER_OPTIONS.map(option => (
            <Picker.Item key={option.label} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Event</Text>
      </TouchableOpacity>
    </View>
  );
}

// For React Native Picker (community module)
// Install if missing: npx expo install @react-native-picker/picker

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 22 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 18 },
  label: { fontSize: 15, fontWeight: 'bold', marginTop: 8, marginBottom: 3 },
  calendarList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  calendarItem: { backgroundColor: '#e9ecef', borderRadius: 8, padding: 8, marginRight: 8, marginBottom: 8 },
  calendarItemSelected: { backgroundColor: '#007bff' },
  calName: { color: '#222' },
  pickerButton: { borderRadius: 8, backgroundColor: '#eee', marginBottom: 12 },
  pickerText: { fontSize: 16, padding: 8 },
  saveButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 22 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});
