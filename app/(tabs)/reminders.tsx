import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const SETTINGS_KEY = 'scheduler.settings.v1';

type Settings = {
  rolloverEnabled: boolean;
  autoPurgeCompletedDays: number | null;
  username?: string;
  fullName?: string;
  password?: string;
  email?: string | null;
  authProvider?: 'google' | 'apple' | 'local' | null;
  subscription?: string | null;
  dailyFocusGoalMin?: number | null;
  weeklyPomoGoal?: number | null;
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    rolloverEnabled: true,
    autoPurgeCompletedDays: null,
    authProvider: null,
    subscription: null,
  });
  const [accountOpen, setAccountOpen] = useState(true);
  const [taskOpen, setTaskOpen] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) setSettings(prev => ({ ...prev, ...JSON.parse(raw) }));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => Keyboard.dismiss()} />
          <Text style={styles.header}>Settings</Text>

      {/* Account Info */}
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setAccountOpen(!accountOpen)} style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Account Info</Text>
          <Text style={styles.cardChevron}>{accountOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {accountOpen && (
          <View style={styles.cardBody}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#8e8e93" autoCapitalize="none" value={settings.username} onChangeText={(t)=>setSettings(s=>({...s, username:t}))} />
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#8e8e93" value={settings.fullName} onChangeText={(t)=>setSettings(s=>({...s, fullName:t}))} />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8e8e93" keyboardType="email-address" autoCapitalize="none" value={(settings as any).email} onChangeText={(t)=>setSettings(s=>({...s, email:t as any}))} />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8e8e93" secureTextEntry value={settings.password} onChangeText={(t)=>setSettings(s=>({...s, password:t}))} />
            <TouchableOpacity
              onPress={async () => {
                try {
                  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                  if (settings.username) await AsyncStorage.setItem('account.username', settings.username);
                  setSaved('Saved');
                  setTimeout(()=>setSaved(null), 1200);
                } catch {}
              }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveTxt}>Save</Text>
            </TouchableOpacity>
            {saved && <Text style={[styles.hint, { textAlign: 'center', marginTop: 6 }]}>{saved}</Text>}
          </View>
        )}
      </View>

      {/* Task Settings */}
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setTaskOpen(!taskOpen)} style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Task Settings</Text>
          <Text style={styles.cardChevron}>{taskOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {taskOpen && (
          <View style={styles.cardBody}>
            <View style={styles.row}> 
              <Text style={styles.label}>Rollover incomplete previous tasks to today</Text>
              <Switch value={settings.rolloverEnabled} onValueChange={(v) => setSettings(s => ({ ...s, rolloverEnabled: v }))} />
            </View>
            <Text style={[styles.smallLabel]}>The completed list automatically clears after the set number of days</Text>
            <TextInput
              style={styles.input}
              placeholder="Days to keep completed (e.g., 30)"
              placeholderTextColor="#8e8e93"
              keyboardType="number-pad"
              value={settings.autoPurgeCompletedDays?.toString() ?? ''}
              onChangeText={(t) => setSettings(s => ({ ...s, autoPurgeCompletedDays: t ? Number(t) : null }))}
            />
            <Text style={styles.hint}>Older completed tasks will be removed automatically.</Text>
            <Text style={[styles.smallLabel, { marginTop: 10 }]}>Daily focus goal (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Minutes to focus per day (e.g., 60)"
              placeholderTextColor="#8e8e93"
              keyboardType="number-pad"
              value={settings.dailyFocusGoalMin?.toString() ?? ''}
              onChangeText={(t) => setSettings(s => ({ ...s, dailyFocusGoalMin: t ? Number(t) : null }))}
            />
            <Text style={styles.hint}>Used for streaks and daily progress on Home.</Text>
            <Text style={[styles.smallLabel, { marginTop: 10 }]}>Weekly pomodoros goal</Text>
            <TextInput
              style={styles.input}
              placeholder="Pomodoro sessions per week (e.g., 25)"
              placeholderTextColor="#8e8e93"
              keyboardType="number-pad"
              value={settings.weeklyPomoGoal?.toString() ?? ''}
              onChangeText={(t) => setSettings(s => ({ ...s, weeklyPomoGoal: t ? Number(t) : null }))}
            />
            <Text style={styles.hint}>A pomodoro counts when a work session is completed.</Text>
            <Text style={styles.hint}>Tap outside to auto-save.</Text>
          </View>
        )}
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  header: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#38383a' },
  label: { color: '#fff', fontSize: 16, flex: 1, marginRight: 12 },
  smallLabel: { color: '#9ca3af', fontSize: 13, marginTop: 6 },
  input: { backgroundColor: '#1c1c1e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', marginTop: 8 },
  hint: { color: '#8e8e93', fontSize: 12, marginTop: 6 },
  card: { backgroundColor: '#121317', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1f1f23' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardChevron: { color: '#8e8e93' },
  cardBody: { marginTop: 10 },
  saveBtn: { marginTop: 18, backgroundColor: '#67c99a', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveTxt: { color: '#0b0b0c', fontWeight: '700' },
});