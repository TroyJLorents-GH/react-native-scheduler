import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusContext } from '../context/FocusContext';

function fmt(sec: number) {
  const m = Math.floor(sec / 60); const s = sec % 60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function GlobalFocusBanner() {
  const { session, pause, resume, stop } = useFocusContext();
  const screen = Dimensions.get('window');
  const [isCompact, setIsCompact] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const HANDLE_W = 32; // side handle width (longer, slightly wider)
  const HANDLE_H = 90;
  const PANEL_W = isCompact ? 200 : 280; // panel width (expanded shows title)
  const PANEL_H = HANDLE_H; // match handle height so contents stay inside

  const loadPos = async () => {
    try {
      const raw = await AsyncStorage.getItem('focus.panel.state');
      if (!raw) return { y: 120, open: true, compact: true };
      const p = JSON.parse(raw);
      return { y: Math.min(Math.max(40, p.y ?? 120), screen.height - PANEL_H - 100), open: p.open ?? true, compact: p.compact ?? true };
    } catch {
      return { y: 120, open: true, compact: true };
    }
  };

  const [ready, setReady] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;
  const yPos = useRef(new Animated.Value(120)).current;
  const dragStartY = useRef<number>(120);
  useEffect(() => { (async () => { const p = await loadPos(); yPos.setValue(p.y); setIsOpen(p.open); setIsCompact(p.compact); setReady(true); })(); }, []);

  const saveState = async (open: boolean, compact: boolean, y: number) => {
    try { await AsyncStorage.setItem('focus.panel.state', JSON.stringify({ open, compact, y })); } catch {}
  };

  const paused = !!session && session.phase === 'paused';
  const boxOpacity = .8; // opacity level 1.0 is fuly opaque
  const openX = HANDLE_W + 6; // small gap between handle and panel
  const closedX = -PANEL_W; // fully hidden; handle rendered separately

  useEffect(() => {
    if (!ready) return;
    Animated.spring(slideX, { toValue: isOpen ? openX : closedX, useNativeDriver: true, bounciness: 8 }).start(() => {
      (async () => { const y = (yPos as any)._value ?? 64; await saveState(isOpen, isCompact, y); })();
    });
  }, [ready, isOpen, isCompact, PANEL_W]);

  // Vertical drag on the handle to reposition panel/handle together
  const handlePan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderGrant: () => {
      dragStartY.current = (yPos as any)._value ?? 120;
    },
    onPanResponderMove: (_e, g) => {
      const minY = 40; const maxY = screen.height - PANEL_H - 100;
      const next = Math.min(maxY, Math.max(minY, dragStartY.current + g.dy));
      yPos.setValue(next);
    },
    onPanResponderRelease: async () => {
      const y = (yPos as any)._value ?? 120;
      await saveState(isOpen, isCompact, y);
    },
  }), [screen.height, PANEL_H, isOpen, isCompact]);

  if (!session || !ready) return null;

  return (
    <>
      {/* Side handle - separate from panel so panel is fully hidden when closed */}
      <Animated.View style={[s.handleWrap, { transform: [{ translateY: yPos }] }] } {...handlePan.panHandlers}>
        <TouchableOpacity style={s.handleTab} activeOpacity={0.9} onPress={() => setIsOpen(prev => !prev)}>
          <Ionicons name={isOpen ? 'chevron-back' : 'chevron-forward'} size={26} color="#0f172a" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[s.panel, isCompact ? s.panelCompact : s.panelExpanded, { opacity: boxOpacity, transform: [{ translateX: slideX }, { translateY: yPos }] } ]}>
        <TouchableOpacity style={s.row} activeOpacity={0.9}>
          <Ionicons name="time-outline" size={18} color="#000" />
          <Text style={s.timeTxt}>{fmt(session.remainingSec)}</Text>
          {!isCompact && <View style={{ width: 1, height: 18, backgroundColor: '#000', opacity: 0.3, marginHorizontal: 8 }} />}
          {!isCompact && <Text style={s.title} numberOfLines={1}>{session.title}</Text>}
        </TouchableOpacity>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => setIsCompact(prev => !prev)} style={[s.iconBtn, { backgroundColor: '#e5e7eb' }]}> 
            <Ionicons name={isCompact ? 'expand' : 'contract'} size={14} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={paused ? resume : pause} style={[s.iconBtn, { backgroundColor: paused ? '#10b981' : '#fbbf24' }]}>
            <Ionicons name={paused ? 'play' : 'pause'} size={14} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={stop} style={[s.iconBtn, { backgroundColor: '#ef4444' }]}>
            <Ionicons name="stop" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  panel: { position: 'absolute', left: 0, zIndex: 999, borderRadius: 16, backgroundColor: '#96979C', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, overflow: 'hidden' },
  panelCompact: { width: 200, height: 90 },
  panelExpanded: { width: 280, height: 90 },
  handleWrap: { position: 'absolute', left: 0, zIndex: 1000 },
  handleTab: { width: 32, height: 90, borderTopRightRadius: 14, borderBottomRightRadius: 14, backgroundColor: '#96979C', alignItems: 'center', justifyContent: 'center', opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  title: { color: '#010205', fontWeight: '700', flex: 1 },
  timeTxt: { color: '#010205', fontWeight: '800', marginLeft: 6 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  gripDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#0f172a', marginHorizontal: 2 },
});


