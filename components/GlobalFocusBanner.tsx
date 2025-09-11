import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusContext } from '../context/FocusContext';

function fmt(sec: number) {
  const m = Math.floor(sec / 60); const s = sec % 60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function GlobalFocusBanner() {
  const { session, pause, resume, stop } = useFocusContext();
  const screen = Dimensions.get('window');
  const [isCompact, setIsCompact] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const PANEL_W = isCompact ? 200 : 280; // panel width
  const PANEL_H = isCompact ? 50 : 66;
  const HANDLE_W = 22; // visible handle when closed
  const PADDING = 12;

  const loadPos = async () => {
    try {
      const raw = await AsyncStorage.getItem('focus.panel.state');
      if (!raw) return { y: 64, open: true, compact: true };
      const p = JSON.parse(raw);
      return { y: Math.min(Math.max(0, p.y ?? 64), screen.height - PANEL_H - 100), open: p.open ?? true, compact: p.compact ?? true };
    } catch {
      return { y: 64, open: true, compact: true };
    }
  };

  const [ready, setReady] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;
  const yPos = useRef(new Animated.Value(64)).current;
  useEffect(() => { (async () => { const p = await loadPos(); yPos.setValue(p.y); setIsOpen(p.open); setIsCompact(p.compact); setReady(true); })(); }, []);

  const saveState = async (open: boolean, compact: boolean, y: number) => {
    try { await AsyncStorage.setItem('focus.panel.state', JSON.stringify({ open, compact, y })); } catch {}
  };

  const paused = !!session && session.phase === 'paused';
  const boxOpacity = paused ? 0.75 : 0.95;
  const openX = 0;
  const closedX = -PANEL_W + HANDLE_W;

  useEffect(() => {
    if (!ready) return;
    Animated.spring(slideX, { toValue: isOpen ? openX : closedX, useNativeDriver: true, bounciness: 8 }).start(() => {
      (async () => { const y = (yPos as any)._value ?? 64; await saveState(isOpen, isCompact, y); })();
    });
  }, [ready, isOpen, isCompact, PANEL_W]);

  if (!session || !ready) return null;

  return (
    <Animated.View style={[s.panel, isCompact ? s.panelCompact : s.panelExpanded, { opacity: boxOpacity, transform: [{ translateX: slideX }, { translateY: yPos }] }] }>
      {/* Handle chevron - always visible */}
      <TouchableOpacity style={s.handleTab} onPress={() => setIsOpen(prev => !prev)}>
        <Ionicons name={isOpen ? 'chevron-back' : 'chevron-forward'} size={16} color="#0f172a" />
      </TouchableOpacity>
      <TouchableOpacity
        style={s.row}
        activeOpacity={0.9}
        onPress={() => {
          // Open the relevant screen
          if (session.source === 'task') {
            router.push({ pathname: '/task-details', params: { id: session.id } });
          } else {
            router.push('/(tabs)/today');
          }
        }}
      >
        <Ionicons name="time-outline" size={18} color="#0f172a" />
        <Text style={s.timeTxt}>{fmt(session.remainingSec)}</Text>
        {!isCompact && <View style={{ width: 1, height: 18, backgroundColor: '#94a3b8', marginHorizontal: 8 }} />}
        {!isCompact && <Text style={s.title} numberOfLines={1}>{session.title}</Text>}
      </TouchableOpacity>
      <View style={s.actions}>
        <TouchableOpacity onPress={() => setIsCompact(prev => !prev)} style={[s.iconBtn, { backgroundColor: '#e5e7eb' }]}> 
          <Ionicons name={isCompact ? 'expand' : 'contract'} size={14} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity onPress={paused ? resume : pause} style={[s.iconBtn, { backgroundColor: paused ? '#10b981' : '#fbbf24' }]}>
          <Ionicons name={paused ? 'play' : 'pause'} size={14} color="#0b0b0c" />
        </TouchableOpacity>
        <TouchableOpacity onPress={stop} style={[s.iconBtn, { backgroundColor: '#ef4444' }]}>
          <Ionicons name="stop" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  panel: { position: 'absolute', left: 0, zIndex: 1000, borderRadius: 16, backgroundColor: '#c7d2fe', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  panelCompact: { width: 200, height: 50 },
  panelExpanded: { width: 280, height: 66 },
  handleTab: { position: 'absolute', right: -18, width: 18, height: 46, borderTopRightRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#c7d2fe', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  title: { color: '#0f172a', fontWeight: '700', flex: 1 },
  timeTxt: { color: '#0f172a', fontWeight: '800', marginLeft: 6 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  gripDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#0f172a', marginHorizontal: 2 },
});


