import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  FlatList, Dimensions, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import Pushke from '../components/Pushke';
import CoinButton from '../components/CoinButton';
import AudioEngine from '../components/AudioEngine';
import PaymentScreen from './PaymentScreen';

const { width: SW } = Dimensions.get('window');

const COINS = [
  { value: 0.5, label: '½ ₪',  freq: 1380 },
  { value: 1,   label: '₪1',   freq: 950  },
  { value: 2,   label: '₪2',   freq: 750  },
  { value: 5,   label: '₪5',   freq: 620  },
  { value: 10,  label: '₪10',  freq: 420  },
];

const DIAM    = { 0.5: 68, 1: 76, 2: 84, 5: 92, 10: 104 };
const CARD_W  = SW * 0.34;
const CARD_PAD = (SW - CARD_W) / 2;
const INIT_IDX = 3; // ₪5

function fmt(n) {
  if (n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export default function HomeScreen() {
  const audioRef        = useRef(null);
  const flatRef         = useRef(null);
  const pushkeRef       = useRef(null);
  const containerRef    = useRef(null);
  const scrollX         = useRef(new Animated.Value(INIT_IDX * CARD_W)).current;
  const dragX           = useRef(new Animated.Value(0)).current;
  const dragY           = useRef(new Animated.Value(0)).current;
  const dragScale       = useRef(new Animated.Value(1)).current;
  // Page-absolute coords of slot center and container top-left
  const slotPageX       = useRef(SW / 2);
  const slotPageY       = useRef(500);
  const containerOrigin = useRef({ x: 0, y: 0 });
  const dragCoin        = useRef(COINS[INIT_IDX]);
  const insertingRef    = useRef(false); // guard against double-fire

  const [total,      setTotal]      = useState(0);
  const [coinCount,  setCoinCount]  = useState(0);
  const [selIdx,     setSelIdx]     = useState(INIT_IDX);
  const [showDonate, setShowDonate] = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [slotActive, setSlotActive] = useState(false);

  const selectedCoin = COINS[selIdx];

  useEffect(() => {
    const t = setTimeout(() => {
      flatRef.current?.scrollToIndex({ index: INIT_IDX, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Measure container origin so we can convert screen pageX/Y → relative coords
  const measureContainer = useCallback(() => {
    containerRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
      containerOrigin.current = { x: px, y: py };
    });
  }, []);

  // Measure where the pushke slot sits in absolute screen space
  const measureSlot = useCallback(() => {
    setTimeout(() => {
      pushkeRef.current?.measure((_x, _y, w, h, pageX, pageY) => {
        const pw = w || SW * 0.95;
        const ph = h || SW * 0.65;
        slotPageX.current = pageX + pw / 2;
        slotPageY.current = pageY + ph * 0.20;
      });
    }, 400);
  }, []);

  const insertCoin = useCallback((coin) => {
    setTotal(t => Math.round((t + coin.value) * 10) / 10);
    setCoinCount(c => c + 1);
    // Play the uploaded MP3 for this denomination
    audioRef.current?.playCoin();
    Haptics.impactAsync(
      coin.value >= 5  ? Haptics.ImpactFeedbackStyle.Heavy  :
      coin.value >= 1  ? Haptics.ImpactFeedbackStyle.Medium :
                         Haptics.ImpactFeedbackStyle.Light
    );
  }, []);

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,

    onPanResponderGrant: (e) => {
      const { pageX, pageY } = e.nativeEvent;
      const d = DIAM[selectedCoin.value] || 80;
      dragCoin.current = selectedCoin;
      insertingRef.current = false;
      dragScale.setValue(1);
      // Position coin under finger (container-relative coords)
      dragX.setValue(pageX - containerOrigin.current.x - d / 2);
      dragY.setValue(pageY - containerOrigin.current.y - d / 2);
      setDragging(true);
      Haptics.selectionAsync();
    },

    onPanResponderMove: (e) => {
      if (insertingRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const d = DIAM[dragCoin.current.value] || 80;
      dragX.setValue(pageX - containerOrigin.current.x - d / 2);
      dragY.setValue(pageY - containerOrigin.current.y - d / 2);
      const near =
        Math.abs(pageX - slotPageX.current) < 90 &&
        Math.abs(pageY - slotPageY.current) < 70;
      setSlotActive(near);
    },

    onPanResponderRelease: (e) => {
      if (insertingRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const d = DIAM[dragCoin.current.value] || 80;
      const nearX = Math.abs(pageX - slotPageX.current) < 90;
      const nearY = Math.abs(pageY - slotPageY.current) < 70;

      if (nearX && nearY) {
        insertingRef.current = true;
        setSlotActive(false);

        const snapX = slotPageX.current - containerOrigin.current.x - d / 2;
        const snapY = slotPageY.current - containerOrigin.current.y - d / 2;

        // Snap coin to slot center
        Animated.parallel([
          Animated.timing(dragX, { toValue: snapX, duration: 140, useNativeDriver: false }),
          Animated.timing(dragY, { toValue: snapY, duration: 140, useNativeDriver: false }),
        ]).start(() => {
          // Coin reached slot: play sound + haptic, then shrink into slot
          insertCoin(dragCoin.current);
          Animated.timing(dragScale, {
            toValue: 0,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            setDragging(false);
            dragScale.setValue(1);
            insertingRef.current = false;
          });
        });
      } else {
        // Missed — bounce back
        setSlotActive(false);
        Animated.spring(dragScale, {
          toValue: 0.6,
          useNativeDriver: false,
          tension: 300,
          friction: 5,
        }).start(() => {
          setDragging(false);
          dragScale.setValue(1);
        });
      }
    },

    onPanResponderTerminate: () => {
      setDragging(false);
      setSlotActive(false);
      dragScale.setValue(1);
      insertingRef.current = false;
    },
  }), [selectedCoin, dragX, dragY, dragScale, insertCoin]);

  const renderCoin = useCallback(({ item, index }) => {
    const range = [(index - 1) * CARD_W, index * CARD_W, (index + 1) * CARD_W];
    const scale   = scrollX.interpolate({ inputRange: range, outputRange: [0.72, 1, 0.72], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange: range, outputRange: [0.4,  1, 0.4],  extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.coinCard, { transform: [{ scale }], opacity }]}>
        <CoinButton coin={item} onPress={() => {
          setSelIdx(index);
          flatRef.current?.scrollToIndex({ index, animated: true });
        }} />
        <Text style={styles.coinCardLabel}>{item.label}</Text>
      </Animated.View>
    );
  }, [scrollX]);

  return (
    <SafeAreaView style={styles.safe}>
      <View
        ref={containerRef}
        style={styles.inner}
        onLayout={measureContainer}
      >
        <AudioEngine ref={audioRef} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>בית חב״ד</Text>
          <Text style={styles.headerSub}>קרית בורוכוב ותל גנים</Text>
        </View>

        {/* Denomination carousel */}
        <Animated.FlatList
          ref={flatRef}
          data={COINS}
          keyExtractor={c => String(c.value)}
          renderItem={renderCoin}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W}
          snapToAlignment="center"
          decelerationRate="fast"
          style={styles.carousel}
          contentContainerStyle={{ paddingHorizontal: CARD_PAD }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          getItemLayout={(_, i) => ({ length: CARD_W, offset: CARD_W * i, index: i })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
            setSelIdx(Math.max(0, Math.min(COINS.length - 1, idx)));
          }}
        />

        {/* Draggable coin — grab here and drag down into the slot */}
        <View style={styles.dragArea} {...pan.panHandlers}>
          <View style={[styles.dragToken, dragging && styles.dragTokenGhost]}>
            <CoinButton coin={selectedCoin} onPress={() => {}} />
          </View>
          <Text style={styles.dragHint}>↓  גרור לתוך חריץ הפושקה  ↓</Text>
        </View>

        {/* Pushka box */}
        <View
          ref={pushkeRef}
          style={styles.pushkeWrap}
          onLayout={measureSlot}
        >
          <Pushke width={SW * 0.95} height={SW * 0.65} slotActive={slotActive} />
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <View style={styles.totalWrap}>
            <Text style={styles.totalAmount}>{fmt(total)} ₪</Text>
            <Text style={styles.totalLabel}>
              {coinCount === 0
                ? 'גרור מטבע לפושקה'
                : `${coinCount} מטבע${coinCount === 1 ? '' : 'ות'}`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.donateBtn, total === 0 && styles.donateBtnOff]}
            onPress={() => {
              if (total === 0) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                return;
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowDonate(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.donateBtnText}>
              {total > 0 ? `תרום ${fmt(total)} ₪` : 'תרום'} 💙
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating coin — follows finger while dragging, shrinks into slot */}
        {dragging && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.floatingCoin,
              { left: dragX, top: dragY, transform: [{ scale: dragScale }] },
            ]}
          >
            <CoinButton coin={dragCoin.current} onPress={() => {}} />
          </Animated.View>
        )}

        <PaymentScreen
          visible={showDonate}
          total={total}
          coinCount={coinCount}
          onClose={() => setShowDonate(false)}
          onReset={() => { setTotal(0); setCoinCount(0); setShowDonate(false); }}
        />
      </View>
    </SafeAreaView>
  );
}

const BG     = '#eeeaf8';
const INDIGO = '#1e1b8a';
const MUTED  = '#7070a0';

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: BG },
  inner: { flex: 1 },

  header:      { alignItems: 'center', paddingTop: 6, paddingBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: INDIGO },
  headerSub:   { fontSize: 11, color: MUTED },

  carousel:      { height: 108, flexGrow: 0 },
  coinCard:      { width: CARD_W, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  coinCardLabel: { color: MUTED, fontSize: 11, marginTop: 2 },

  dragArea:      { alignItems: 'center', paddingVertical: 6 },
  dragToken:     { },
  dragTokenGhost: { opacity: 0.2 },
  dragHint:      { color: INDIGO, fontSize: 13, fontWeight: '700', marginTop: 4, opacity: 0.65 },

  pushkeWrap: { alignItems: 'center', flex: 1 },

  bottomBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  totalWrap:   { flex: 1 },
  totalAmount: { fontSize: 28, fontWeight: '900', color: INDIGO },
  totalLabel:  { fontSize: 11, color: MUTED },

  donateBtn: {
    backgroundColor: INDIGO, paddingVertical: 12, paddingHorizontal: 18,
    borderRadius: 24, shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  donateBtnOff:  { backgroundColor: '#b0b0c8', shadowOpacity: 0 },
  donateBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

  floatingCoin: { position: 'absolute', zIndex: 999 },
});
