import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  FlatList, Dimensions, PanResponder, Image, Alert,
} from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import CoinButton, { COIN_DIAM } from '../components/CoinButton';
import AudioEngine from '../components/AudioEngine';
import PaymentScreen from './PaymentScreen';

const { width: SW, height: SH } = Dimensions.get('window');

const PUSHKA_IMG    = require('../../assets/pushka.jpg');
const PUSHKA_ASPECT = 676 / 999;   // original image ratio
const PUSHKA_H      = SH * 0.65;
const PUSHKA_W      = PUSHKA_H * PUSHKA_ASPECT;
// Coin slot center in the pushka image (normalized to image height)
const SLOT_Y_NORM   = 52 / 999;

const COINS = [
  { value: 0.5, label: '½ ₪' },
  { value: 1,   label: '₪1'  },
  { value: 2,   label: '₪2'  },
  { value: 5,   label: '₪5'  },
  { value: 10,  label: '₪10' },
];

// Infinite carousel — repeat coins 60 times, start in the middle
const LOOP       = 60;
const LOOP_DATA  = Array.from({ length: LOOP }, () => COINS).flat();
const INIT_IDX   = Math.floor(LOOP / 2) * COINS.length + 3; // start at ₪5

const CARD_W  = SW * 0.32;
const CARD_PAD = (SW - CARD_W) / 2;

function fmt(n) {
  if (n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export default function HomeScreen() {
  const audioRef        = useRef(null);
  const flatRef         = useRef(null);
  const containerRef    = useRef(null);
  const pushkaRef       = useRef(null);
  const scrollX         = useRef(new Animated.Value(INIT_IDX * CARD_W)).current;
  const dragX           = useRef(new Animated.Value(0)).current;
  const dragY           = useRef(new Animated.Value(0)).current;
  const dragScale       = useRef(new Animated.Value(1)).current;
  const containerOrigin = useRef({ x: 0, y: 0 });
  const slotPageX       = useRef(SW / 2);
  const slotPageY       = useRef(400);
  const dragCoin        = useRef(COINS[3]);
  const insertingRef    = useRef(false);
  const selIdxRef       = useRef(INIT_IDX);

  const [total,      setTotal]      = useState(0);
  const [coinCount,  setCoinCount]  = useState(0);
  const [selIdx,     setSelIdx]     = useState(INIT_IDX);
  const [showDonate, setShowDonate] = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [slotActive, setSlotActive] = useState(false);

  const selectedCoin = LOOP_DATA[selIdx];

  // Scroll to initial position on mount
  useEffect(() => {
    const t = setTimeout(() => {
      flatRef.current?.scrollToIndex({ index: INIT_IDX, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Keep selIdxRef in sync for PanResponder closure
  useEffect(() => { selIdxRef.current = selIdx; }, [selIdx]);

  const measureContainer = useCallback(() => {
    containerRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
      containerOrigin.current = { x: px, y: py };
    });
  }, []);

  const measureSlot = useCallback(() => {
    setTimeout(() => {
      pushkaRef.current?.measure((_x, _y, w, h, pageX, pageY) => {
        const ph = h  || PUSHKA_H;
        const pw = w  || PUSHKA_W;
        // slot is horizontally centered in the pushka image
        slotPageX.current = pageX + pw / 2;
        slotPageY.current = pageY + ph * SLOT_Y_NORM;
      });
    }, 400);
  }, []);

  const insertCoin = useCallback((coin) => {
    setTotal(t => Math.round((t + coin.value) * 10) / 10);
    setCoinCount(c => c + 1);
    audioRef.current?.playCoin();
    Haptics.impactAsync(
      coin.value >= 5  ? Haptics.ImpactFeedbackStyle.Heavy  :
      coin.value >= 1  ? Haptics.ImpactFeedbackStyle.Medium :
                         Haptics.ImpactFeedbackStyle.Light
    );
  }, []);

  // PanResponder: sits over entire carousel area
  // onStartShouldSetPanResponder = false → FlatList handles horizontal scrolling
  // onMoveShouldSetPanResponder  = true  → only when clearly dragging downward
  const carouselPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gs) =>
      !insertingRef.current &&
      gs.dy > 10 &&
      Math.abs(gs.dy) > Math.abs(gs.dx) * 1.5,

    onPanResponderGrant: (e) => {
      const coin = LOOP_DATA[selIdxRef.current];
      const { pageX, pageY } = e.nativeEvent;
      const d = COIN_DIAM[coin.value] || 72;
      dragCoin.current = coin;
      insertingRef.current = false;
      dragScale.setValue(1);
      dragX.setValue(pageX - containerOrigin.current.x - d / 2);
      dragY.setValue(pageY - containerOrigin.current.y - d / 2);
      setDragging(true);
      Haptics.selectionAsync();
    },

    onPanResponderMove: (e) => {
      if (insertingRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const d = COIN_DIAM[dragCoin.current.value] || 72;
      dragX.setValue(pageX - containerOrigin.current.x - d / 2);
      dragY.setValue(pageY - containerOrigin.current.y - d / 2);
      const near =
        Math.abs(pageX - slotPageX.current) < 80 &&
        Math.abs(pageY - slotPageY.current) < 60;
      setSlotActive(near);
    },

    onPanResponderRelease: (e) => {
      if (insertingRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const d = COIN_DIAM[dragCoin.current.value] || 72;
      const nearX = Math.abs(pageX - slotPageX.current) < 80;
      const nearY = Math.abs(pageY - slotPageY.current) < 60;

      if (nearX && nearY) {
        insertingRef.current = true;
        setSlotActive(false);
        const snapX = slotPageX.current - containerOrigin.current.x - d / 2;
        const snapY = slotPageY.current - containerOrigin.current.y - d / 2;
        Animated.parallel([
          Animated.timing(dragX, { toValue: snapX, duration: 140, useNativeDriver: false }),
          Animated.timing(dragY, { toValue: snapY, duration: 140, useNativeDriver: false }),
        ]).start(() => {
          insertCoin(dragCoin.current);
          Animated.timing(dragScale, { toValue: 0, duration: 100, useNativeDriver: false })
            .start(() => {
              setDragging(false);
              dragScale.setValue(1);
              insertingRef.current = false;
            });
        });
      } else {
        // missed — bounce away
        Animated.timing(dragScale, { toValue: 0, duration: 120, useNativeDriver: false })
          .start(() => {
            setDragging(false);
            dragScale.setValue(1);
          });
        setSlotActive(false);
      }
    },

    onPanResponderTerminate: () => {
      setDragging(false);
      setSlotActive(false);
      dragScale.setValue(1);
      insertingRef.current = false;
    },
  }), [dragX, dragY, dragScale, insertCoin]);

  const renderCoin = useCallback(({ item, index }) => {
    const range = [(index - 1) * CARD_W, index * CARD_W, (index + 1) * CARD_W];
    const scale   = scrollX.interpolate({ inputRange: range, outputRange: [0.70, 1, 0.70], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange: range, outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.coinCard, { transform: [{ scale }], opacity }]}>
        <CoinButton
          coin={item}
          onPress={() => {
            setSelIdx(index);
            flatRef.current?.scrollToIndex({ index, animated: true });
          }}
        />
      </Animated.View>
    );
  }, [scrollX]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'איפוס',
      'לאפס את סכום הפושקה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אפס', style: 'destructive',
          onPress: () => { setTotal(0); setCoinCount(0); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View ref={containerRef} style={styles.inner} onLayout={measureContainer}>
        <AudioEngine ref={audioRef} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>בית חב״ד</Text>
          <Text style={styles.headerSub}>קרית בורוכוב ותל גנים</Text>
        </View>

        {/* ── Carousel + drag overlay ── */}
        <View style={styles.carouselWrap}>
          <Animated.FlatList
            ref={flatRef}
            data={LOOP_DATA}
            keyExtractor={(_, i) => String(i)}
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
              const clamped = Math.max(0, Math.min(LOOP_DATA.length - 1, idx));
              setSelIdx(clamped);
            }}
            initialNumToRender={11}
            windowSize={5}
            removeClippedSubviews
          />
          {/* Transparent overlay to capture downward drags from carousel */}
          <View style={StyleSheet.absoluteFill} {...carouselPan.panHandlers} />
        </View>

        {/* Drag hint */}
        <Text style={styles.dragHint}>↓  גרור מטבע לתוך חריץ הפושקה  ↓</Text>

        {/* ── Pushka image ── */}
        <View
          ref={pushkaRef}
          style={styles.pushkaWrap}
          onLayout={measureSlot}
        >
          <Image
            source={PUSHKA_IMG}
            style={{ width: PUSHKA_W, height: PUSHKA_H }}
            resizeMode="contain"
          />
          {/* Slot glow overlay */}
          {slotActive && (
            <Svg
              width={PUSHKA_W}
              height={PUSHKA_H}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Ellipse
                cx={PUSHKA_W / 2}
                cy={PUSHKA_H * SLOT_Y_NORM}
                rx={PUSHKA_W * 0.15}
                ry={PUSHKA_H * 0.018}
                fill="#FFD700"
                opacity={0.75}
              />
            </Svg>
          )}
        </View>

        {/* ── Bottom bar ── */}
        <View style={styles.bottomBar}>
          <View style={styles.totalWrap}>
            <Text style={styles.totalAmount}>{fmt(total)} ₪</Text>
            <Text style={styles.totalLabel}>
              {coinCount === 0 ? 'גרור מטבע לפושקה' : `${coinCount} מטבע${coinCount === 1 ? '' : 'ות'}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>↺</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.donateBtn, total === 0 && styles.donateBtnOff]}
            onPress={() => {
              if (total === 0) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return; }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowDonate(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.donateBtnText}>{total > 0 ? `תרום ${fmt(total)} ₪` : 'תרום'} 💙</Text>
          </TouchableOpacity>
        </View>

        {/* ── Floating coin follows finger ── */}
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

const BG     = '#f5f3fc';
const INDIGO = '#1e1b8a';
const MUTED  = '#7070a0';

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: BG },
  inner: { flex: 1 },

  header:      { alignItems: 'center', paddingTop: 6, paddingBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: INDIGO },
  headerSub:   { fontSize: 11, color: MUTED },

  carouselWrap: { position: 'relative' },
  carousel:     { height: 110, flexGrow: 0 },
  coinCard:     { width: CARD_W, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },

  dragHint: { textAlign: 'center', color: INDIGO, fontSize: 12, fontWeight: '700', opacity: 0.55, marginTop: 2 },

  pushkaWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },

  bottomBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  totalWrap:   { flex: 1 },
  totalAmount: { fontSize: 28, fontWeight: '900', color: INDIGO },
  totalLabel:  { fontSize: 11, color: MUTED },

  resetBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e8e4f8',
    alignItems: 'center', justifyContent: 'center',
  },
  resetText: { fontSize: 20, color: MUTED },

  donateBtn: {
    backgroundColor: INDIGO, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 24, shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  donateBtnOff:  { backgroundColor: '#b0b0c8', shadowOpacity: 0 },
  donateBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

  floatingCoin: { position: 'absolute', zIndex: 999 },
});
