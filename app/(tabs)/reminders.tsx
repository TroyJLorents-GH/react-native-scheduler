import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

const SETTINGS_KEY = 'scheduler.settings.v1';

type Settings = {
  rolloverEnabled: boolean;
  autoPurgeCompletedDays: number | null;
  username?: string;
  password?: string;
  authProvider?: 'google' | 'apple' | 'local' | null;
  subscription?: string | null;
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    rolloverEnabled: true,
    autoPurgeCompletedDays: null,
    authProvider: null,
    subscription: null,
  });

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
      <Text style={styles.header}>Settings</Text>

      <View style={styles.row}> 
        <Text style={styles.label}>Rollover incomplete previous tasks to today</Text>
        <Switch value={settings.rolloverEnabled} onValueChange={(v) => setSettings(s => ({ ...s, rolloverEnabled: v }))} />
      </View>

      <View style={styles.section}> 
        <Text style={styles.label}>Permanently delete completed tasks after (days)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30"
          keyboardType="number-pad"
          value={settings.autoPurgeCompletedDays?.toString() ?? ''}
          onChangeText={(t) => setSettings(s => ({ ...s, autoPurgeCompletedDays: t ? Number(t) : null }))}
        />
        <Text style={styles.hint}>This will clear the Completed list automatically after the set number of days.</Text>
      </View>

      <View style={styles.section}> 
        <Text style={styles.sectionHeader}>Account (placeholder)</Text>
        <Text style={styles.hint}>Stored locally until sign-in is implemented.</Text>
        <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={settings.username} onChangeText={(t)=>setSettings(s=>({...s, username:t}))} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={settings.password} onChangeText={(t)=>setSettings(s=>({...s, password:t}))} />
        <Text style={styles.hint}>Subscription: {settings.subscription ?? 'Free (mock)'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  header: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#38383a' },
  label: { color: '#fff', fontSize: 16, flex: 1, marginRight: 12 },
  section: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#38383a' },
  sectionHeader: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#1c1c1e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', marginTop: 8 },
  hint: { color: '#8e8e93', fontSize: 12, marginTop: 6 },
});