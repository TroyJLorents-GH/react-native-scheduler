import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Localization from 'expo-localization';
import * as StoreReview from 'expo-store-review';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, type ThemeColors } from '../../context/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';

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
  biometricLockEnabled?: boolean;
  locale?: string;
};

export default function SettingsScreen() {
  const { colors, isDark, mode, setMode } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    rolloverEnabled: true,
    autoPurgeCompletedDays: null,
    authProvider: null,
    subscription: null,
    biometricLockEnabled: false,
  });
  const [accountOpen, setAccountOpen] = useState(true);
  const [taskOpen, setTaskOpen] = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) setSettings(prev => ({ ...prev, ...JSON.parse(raw) }));
      } catch {}
      // Check biometric availability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
      // Check Apple Auth availability
      if (Platform.OS === 'ios') {
        setAppleAuthAvailable(await AppleAuthentication.isAvailableAsync());
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable app lock',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) {
        setSettings(s => ({ ...s, biometricLockEnabled: true }));
      }
    } else {
      setSettings(s => ({ ...s, biometricLockEnabled: false }));
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.fullName?.givenName) {
        const name = `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim();
        setSettings(s => ({
          ...s,
          fullName: name,
          email: credential.email || s.email,
          authProvider: 'apple',
          username: s.username || credential.fullName?.givenName || '',
        }));
        if (credential.fullName.givenName) {
          await AsyncStorage.setItem('account.username', credential.fullName.givenName);
        }
        Alert.alert('Signed In', `Welcome, ${name}!`);
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', 'Apple Sign In failed. Please try again.');
      }
    }
  };

  const handleRateApp = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    } else {
      Alert.alert('Thanks!', 'Rating is not available on this device right now.');
    }
  };

  const locale = Localization.getLocales()[0];

  const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
    { label: 'Light', value: 'light', icon: 'sunny-outline' },
    { label: 'Dark', value: 'dark', icon: 'moon-outline' },
    { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => Keyboard.dismiss()} />
          <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

          {/* Account Info */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAccountOpen(!accountOpen)} style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="person-circle-outline" size={20} color={colors.info} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Account Info</Text>
              </View>
              <Text style={[styles.cardChevron, { color: colors.textSecondary }]}>{accountOpen ? '\u25B2' : '\u25BC'}</Text>
            </TouchableOpacity>
            {accountOpen && (
              <View style={styles.cardBody}>
                <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]} placeholder="Username" placeholderTextColor={colors.placeholder} autoCapitalize="none" value={settings.username} onChangeText={(t)=>setSettings(s=>({...s, username:t}))} />
                <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]} placeholder="Full Name" placeholderTextColor={colors.placeholder} value={settings.fullName} onChangeText={(t)=>setSettings(s=>({...s, fullName:t}))} />
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]} placeholder="Email" placeholderTextColor={colors.placeholder} keyboardType="email-address" autoCapitalize="none" value={settings.email ?? ''} onChangeText={(t)=>setSettings(s=>({...s, email:t}))} />
                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]} placeholder="Password" placeholderTextColor={colors.placeholder} secureTextEntry value={settings.password} onChangeText={(t)=>setSettings(s=>({...s, password:t}))} />

                {appleAuthAvailable && !settings.authProvider && (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={isDark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={10}
                    style={{ width: '100%', height: 44, marginTop: 16 }}
                    onPress={handleAppleSignIn}
                  />
                )}
                {settings.authProvider === 'apple' && (
                  <View style={[styles.authBadge, { backgroundColor: colors.inputBg }]}>
                    <Ionicons name="logo-apple" size={16} color={colors.text} />
                    <Text style={[styles.authBadgeText, { color: colors.textSecondary }]}>Signed in with Apple</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                      if (settings.username) await AsyncStorage.setItem('account.username', settings.username);
                      setSaved('Saved');
                      setTimeout(()=>setSaved(null), 1200);
                    } catch {}
                  }}
                  style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.saveTxt}>Save</Text>
                </TouchableOpacity>
                {saved && <Text style={[styles.hint, { textAlign: 'center', marginTop: 6, color: colors.textSecondary }]}>{saved}</Text>}
              </View>
            )}
          </View>

          {/* Appearance */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAppearanceOpen(!appearanceOpen)} style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="color-palette-outline" size={20} color="#FF9500" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
              </View>
              <Text style={[styles.cardChevron, { color: colors.textSecondary }]}>{appearanceOpen ? '\u25B2' : '\u25BC'}</Text>
            </TouchableOpacity>
            {appearanceOpen && (
              <View style={styles.cardBody}>
                <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Theme</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  {themeOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setMode(opt.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: 'center',
                        backgroundColor: mode === opt.value ? colors.accentLight : colors.inputBg,
                        borderWidth: 1.5,
                        borderColor: mode === opt.value ? colors.accent : colors.border,
                      }}
                    >
                      <Ionicons name={opt.icon as any} size={22} color={mode === opt.value ? colors.accent : colors.textSecondary} />
                      <Text style={{ color: mode === opt.value ? colors.accent : colors.textSecondary, fontWeight: '600', marginTop: 4, fontSize: 13 }}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Task Settings */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setTaskOpen(!taskOpen)} style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkbox-outline" size={20} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Task Settings</Text>
              </View>
              <Text style={[styles.cardChevron, { color: colors.textSecondary }]}>{taskOpen ? '\u25B2' : '\u25BC'}</Text>
            </TouchableOpacity>
            {taskOpen && (
              <View style={styles.cardBody}>
                <View style={[styles.row, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Rollover incomplete previous tasks to today</Text>
                  <Switch value={settings.rolloverEnabled} onValueChange={(v) => setSettings(s => ({ ...s, rolloverEnabled: v }))} trackColor={{ false: colors.border, true: colors.success }} thumbColor="#fff" />
                </View>
                <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>The completed list automatically clears after the set number of days</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                  placeholder="Days to keep completed (e.g., 30)"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  value={settings.autoPurgeCompletedDays?.toString() ?? ''}
                  onChangeText={(t) => setSettings(s => ({ ...s, autoPurgeCompletedDays: t ? Number(t) : null }))}
                />
                <Text style={[styles.hint, { color: colors.textSecondary }]}>Older completed tasks will be removed automatically.</Text>
                <Text style={[styles.smallLabel, { marginTop: 10, color: colors.textSecondary }]}>Daily focus goal (minutes)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                  placeholder="Minutes to focus per day (e.g., 60)"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  value={settings.dailyFocusGoalMin?.toString() ?? ''}
                  onChangeText={(t) => setSettings(s => ({ ...s, dailyFocusGoalMin: t ? Number(t) : null }))}
                />
                <Text style={[styles.hint, { color: colors.textSecondary }]}>Used for streaks and daily progress on Home.</Text>
                <Text style={[styles.smallLabel, { marginTop: 10, color: colors.textSecondary }]}>Weekly pomodoros goal</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                  placeholder="Pomodoro sessions per week (e.g., 25)"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  value={settings.weeklyPomoGoal?.toString() ?? ''}
                  onChangeText={(t) => setSettings(s => ({ ...s, weeklyPomoGoal: t ? Number(t) : null }))}
                />
                <Text style={[styles.hint, { color: colors.textSecondary }]}>A pomodoro counts when a work session is completed.</Text>
              </View>
            )}
          </View>

          {/* Security */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSecurityOpen(!securityOpen)} style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#AF52DE" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Security</Text>
              </View>
              <Text style={[styles.cardChevron, { color: colors.textSecondary }]}>{securityOpen ? '\u25B2' : '\u25BC'}</Text>
            </TouchableOpacity>
            {securityOpen && (
              <View style={styles.cardBody}>
                <View style={[styles.row, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={[styles.label, { color: colors.text }]}>App Lock (Face ID / Touch ID)</Text>
                    <Text style={[styles.hint, { color: colors.textSecondary }]}>
                      {biometricAvailable ? 'Require biometric authentication to open app' : 'Biometric authentication not available on this device'}
                    </Text>
                  </View>
                  <Switch
                    value={settings.biometricLockEnabled ?? false}
                    onValueChange={handleBiometricToggle}
                    disabled={!biometricAvailable}
                    trackColor={{ false: colors.border, true: colors.success }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            )}
          </View>

          {/* About */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAboutOpen(!aboutOpen)} style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="information-circle-outline" size={20} color="#FF9500" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>About</Text>
              </View>
              <Text style={[styles.cardChevron, { color: colors.textSecondary }]}>{aboutOpen ? '\u25B2' : '\u25BC'}</Text>
            </TouchableOpacity>
            {aboutOpen && (
              <View style={styles.cardBody}>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Device</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{Device.modelName || 'Unknown'}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>OS</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{Device.osName} {Device.osVersion}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Locale</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{locale?.languageTag || 'en-US'}</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Timezone</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{Localization.getCalendars()[0]?.timeZone || 'Unknown'}</Text>
                </View>
                <TouchableOpacity style={styles.rateBtn} onPress={handleRateApp}>
                  <Ionicons name="star-outline" size={18} color="#0b0b0c" />
                  <Text style={styles.rateTxt}>Rate This App</Text>
                </TouchableOpacity>
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
  header: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 16 },
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
  authBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#1c1c1e', padding: 10, borderRadius: 8 },
  authBadgeText: { color: '#8e8e93', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1f1f23' },
  infoLabel: { color: '#8e8e93', fontSize: 15 },
  infoValue: { color: '#fff', fontSize: 15, fontWeight: '500' },
  rateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, backgroundColor: '#ffb64f', borderRadius: 10, paddingVertical: 12 },
  rateTxt: { color: '#0b0b0c', fontWeight: '700', fontSize: 15 },
});
