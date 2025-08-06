import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  onPickDateTime: () => void;
};

const now = new Date();
const laterToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0); // 9 PM today
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
const nextWeek = new Date(now);
nextWeek.setDate(now.getDate() + 7);
nextWeek.setHours(9, 0, 0, 0);

export default function ReminderPicker({ visible, onClose, onSelect, onPickDateTime }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetHeader}>Reminder</Text>
          <TouchableOpacity style={styles.option} onPress={() => { onSelect(laterToday); }}>
            <Ionicons name="time-outline" size={26} color="#ffc863" style={styles.icon} />
            <Text style={styles.label}>Later Today</Text>
            <Text style={styles.subLabel}>{laterToday.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { onSelect(tomorrow); }}>
            <MaterialCommunityIcons name="calendar-today" size={26} color="#6dd47e" style={styles.icon} />
            <Text style={styles.label}>Tomorrow</Text>
            <Text style={styles.subLabel}>{tomorrow.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { onSelect(nextWeek); }}>
            <MaterialCommunityIcons name="calendar-week" size={26} color="#5699f6" style={styles.icon} />
            <Text style={styles.label}>Next Week</Text>
            <Text style={styles.subLabel}>{nextWeek.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onPickDateTime}>
            <MaterialCommunityIcons name="calendar-clock" size={26} color="#ab8fe8" style={styles.icon} />
            <Text style={styles.label}>Pick a Date & Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.36)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#181b24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 36,
  },
  sheetHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 21,
    marginBottom: 16,
    alignSelf: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomColor: '#2d2d3b',
    borderBottomWidth: 1,
  },
  icon: { marginRight: 16 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  subLabel: { color: '#b0b8cc', fontSize: 15 },
  doneBtn: { alignSelf: 'flex-end', marginTop: 12, padding: 8 },
  doneText: { color: '#7baaf7', fontWeight: 'bold', fontSize: 17 },
});
