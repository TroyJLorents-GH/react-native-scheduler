import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#1a1b21',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({ ios: 70, android: 64, default: 64 }),
          paddingBottom: Platform.select({ ios: 14, android: 10, default: 10 }),
          paddingTop: 6,
          marginHorizontal: 12,
          marginBottom: Platform.select({ ios: 8, android: 8, default: 8 }),
          borderRadius: 24,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        },
        tabBarActiveTintColor: '#67c99a',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <GlassView style={{ flex: 1 }} />
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,27,33,0.95)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' }} />
          </View>
        ),
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="todo" 
        options={{ 
          title: 'To-Do',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="schedule" 
        options={{ 
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="today" 
        options={{ 
          title: 'Focus',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="reminders" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}

