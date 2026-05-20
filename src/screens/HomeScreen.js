import React, { useState, useRef, useCallback, useEffect } from 'react';
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
const PUSHKA_ASPECT = 676 / 999;
const SLOT_Y_NORM   = 52 / 999;  // coin slot at y=52 in the 999px-tall image

// Fit image to screen: constrained by width (92% of SW) and height (62% of SH)
const PUSHKA_W = Math.min(SW * 0.92, SH * 0.62 * PUSHKA_ASPECT);
const PUSHKA_H = PUSHKA_W / PUSHKA_ASPECT;

const COINS = [
  { value: 0.5, label: '½ ₪' },
  { value: 1,   label: '₪1'  },
  { value: 2,   label: '₪2'  },
  { value: 5,   label: '₪5'  },
  { value: 10,  label: '₪10' },
];

const LOOP      = 60;
const LOOP_DATA = Array.from({ length: LOOP }, () => COINS).flat();
const INIT_IDX  = Math.floor(LOOP / 2) * COINS.length + 3; // start at ₪5

const CARD_W  = SW * 0.30;
const CARD_PAD = (SW - CARD_W) / 2;

function fmt(n) {
  if (n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export default function HomeScreen() {
  const audioRef     = useRef(null);
  const flatRef      = useRef(null);
  const containerRef = useRef(null);
  const pushkaRef    = useRef(null);

  // All animations on JS thread (useNativeDriver: false) for reliability
  const scrollX   = useRef(new Animated.Value(0)).current;
  const dragX     = useRef(new Animated.Value(0)).current;
  const dragY     = useRef(new Animated.Value(0)).current;
  const dragScale = useRef(new Animated.Value(1)).current;

  // Mutable refs — no stale closures in PanResponder
  const insertingRef       = useRef(false);
  const selIdxRef          = useRef(INIT_IDX);
  const dragCoinRef        = useRef(COINS[3]);
  const containerOriginRef = useRef({ x: 0, y: 0 });
  const slotRef            = useRef({ x: SW / 2, y: 250 });

  const [total,      setTotal]      = useState(0);
  const [coinCount,  setCoinCount]  = useState(0);
  const [selIdx,     setSelIdx]     = useState(INIT_IDX);
  const [showDonate, setShowDonate] = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [slotActive, setSlotActive] = useState(false);

  // Scroll to initial position after mount
  useEffect(() => {
    const t = setTimeout(() => {
      flatRef.current?.scrollToIndex({ index: INIT_IDX, animated: false });
      scrollX.setValue(INIT_IDX * CARD_W);
    }, 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { selIdxRef.current = selIdx; }, [selIdx]);

  // Measure absolute positions of container and pushka slot
  const measureAll = useCallback(() => {
    setTimeout(() => {
      containerRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
        containerOriginRef.current = { x: px, y: py };
      });
      pushkaRef.current?.measure((_fx, _fy, wrapW, wrapH, px, py) => {
        // Image is centered in wrapper (alignItems+justifyContent center)
        const imgOffX = (wrapW - PUSHKA_W) / 2;
        const imgOffY = (wrapH - PUSHKA_H) / 2;
        slotRef.current = {
          x: px + imgOffX + PUSHKA_W / 2,
          y: py + Math.max(imgOffY, 0) + PUSHKA_H * SLOT_Y_NORM,
        };
      });
    }, 450);
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

  // PanResponder: overlay on carousel — capture phase wins vertical drags before FlatList
  const carouselPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    // capture phase: claim clearly-downward drags before FlatList can scroll
    onMoveShouldSetPanResponderCapture: (_, gs) =>
      !insertingRef.current &&
      gs.dy > 8 &&
      Math.abs(gs.dy) > Math.abs(gs.dx) * 2,

    onPanResponderGrant: (e) => {
      const coin = LOOP_DATA[selIdxRef.current];
      const { pageX, pageY } = e.nativeEvent;
      const d = COIN_DIAM[coin.value] || 72;
      dragCoinRef.current = coin;
      insertingRef.current = false;
      dragScale.setValue(1.15);
      dragX.setValue(pageX - containerOriginRef.current.x - d / 2);
      dragY.setValue(pageY - containerOriginRef.current.y - d / 2);
      setDragging(true);
      Haptics.selectionAsync();
    },

    onPanResponderMove: (e) => {
      if (insertingRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const d = COIN_DIAM[dragCoinRef.current.value] || 72;
      dragX.setValue(pageX - containerOriginRef.current.x - d / 2);
      dragY.setValue(pageY - containerOriginRef.current.y - d / 2);
      const slot = slotRef.current;
      const near = Math.abs(pageX - slot.x) < 90 && Math.abs(pageY - slot.y) < 70;
      setSlotActive(near);
    },

    onPanResponderRelease: (e) => {
      if (insertingRef.current) return;
      const { pageX, pageY } = e.nativeEvent;
      const d = COIN_DIAM[dragCoinRef.current.value] || 72;
      const slot = slotRef.current;
      const hit = Math.abs(pageX - slot.x) < 90 && Math.abs(pageY - slot.y) < 70;

      setSlotActive(false);
      if (hit) {
        insertingRef.current = true;
        const snapX = slot.x - containerOriginRef.current.x - d / 2;
        const snapY = slot.y - containerOriginRef.current.y - d / 2;
        Animated.parallel([
          Animated.timing(dragX,     { toValue: snapX, duration: 120, useNativeDriver: false }),
          Animated.timing(dragY,     { toValue: snapY, duration: 120, useNativeDriver: false }),
          Animated.timing(dragScale, { toValue: 0.4,  duration: 120, useNativeDriver: false }),
        ]).start(() => {
          insertCoin(dragCoinRef.current);
          Animated.timing(dragScale, { toValue: 0, duration: 80, useNativeDriver: false })
            .start(() => {
              setDragging(false);
              dragScale.setValue(1);
              insertingRef.current = false;
            });
        });
      } else {
        Animated.timing(dragScale, { toValue: 0, duration: 110, useNativeDriver: false })
          .start(() => { setDragging(false); dragScale.setValue(1); });
      }
    },

    onPanResponderTerminate: () => {
      setDragging(false);
      setSlotActive(false);
      dragScale.setValue(1);
      insertingRef.current = false;
    },
  })).current;

  const renderCoin = useCallback(({ item, index }) => {
    const center = index * CARD_W;
    const scale   = scrollX.interpolate({
      inputRange:  [center - CARD_W, center, center + CARD_W],
      outputRange: [0.70, 1, 0.70],
      extrapolate: 'clamp',
    });
    const opacity = scrollX.interpolate({
      inputRange:  [center - CARD_W, center, center + CARD_W],
      outputRange: [0.35, 1, 0.35],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.coinCard, { transform: [{ scale }], opacity }]}>
        <CoinButton
          coin={item}
          onPress={(coin) => {
            selIdxRef.current = index;
            setSelIdx(index);
            flatRef.current?.scrollToIndex({ index, animated: true });
          }}
        />
      </Animated.View>
    );
  }, [scrollX, insertCoin]);

  const handleReset = useCallback(() => {
    Alert.alert('איפוס', 'לאפס את סכום הפושקה?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'אפס', style: 'destructive',
        onPress: () => {
          setTotal(0); setCoinCount(0);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View ref={containerRef} style={styles.inner} onLayout={measureAll}>
        <AudioEngine ref={audioRef} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>בית חב״ד</Text>
          <Text style={styles.headerSub}>קרית בורוכוב ותל גנים</Text>
        </View>

        {/* Carousel */}
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
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            getItemLayout={(_, i) => ({ length: CARD_W, offset: CARD_W * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.max(0, Math.min(
                LOOP_DATA.length - 1,
                Math.round(e.nativeEvent.contentOffset.x / CARD_W)
              ));
              selIdxRef.current = idx;
              setSelIdx(idx);
            }}
            initialNumToRender={11}
            windowSize={7}
            removeClippedSubviews={false}
          />
          <View style={StyleSheet.absoluteFill} {...carouselPan.panHandlers} />
        </View>

        {/* Drag hint */}
        <Text style={styles.dragHint}>↓  גרור מטבע אל חריץ הפושקה  ↓</Text>

        {/* Pushka image */}
        <View ref={pushkaRef} style={styles.pushkaWrap} onLayout={measureAll}>
          <View style={{ width: PUSHKA_W, height: PUSHKA_H }}>
            <Image
              source={PUSHKA_IMG}
              style={{ width: PUSHKA_W, height: PUSHKA_H }}
              resizeMode="contain"
            />
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
                  rx={PUSHKA_W * 0.18}
                  ry={PUSHKA_H * 0.022}
                  fill="#FFD700"
                  opacity={0.85}
                />
              </Svg>
            )}
          </View>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <View style={styles.totalWrap}>
            <Text style={styles.totalAmount}>{fmt(total)} ₪</Text>
            <Text style={styles.totalLabel}>
              {coinCount === 0 ? 'הכנס מטבע לפושקה' : `${coinCount} מטבע${coinCount === 1 ? '' : 'ות'}`}
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

        {/* Floating coin during drag */}
        {dragging && (
          <Animated.View
            pointerEvents="none"
            style={[styles.floatingCoin, {
              left: dragX, top: dragY,
              transform: [{ scale: dragScale }],
            }]}
          >
            <CoinButton coin={dragCoinRef.current} onPress={() => {}} />
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

  header:      { alignItems: 'center', paddingVertical: 8 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: INDIGO },
  headerSub:   { fontSize: 11, color: MUTED },

  carouselWrap: { height: 110, position: 'relative' },
  carousel:     { flex: 1 },
  coinCard:     { width: CARD_W, alignItems: 'center', justifyContent: 'center', height: 110 },

  dragHint: {
    textAlign: 'center', color: INDIGO, fontSize: 12, fontWeight: '700',
    opacity: 0.55, marginVertical: 4,
  },

  pushkaWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  bottomBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  totalWrap:   { flex: 1 },
  totalAmount: { fontSize: 28, fontWeight: '900', color: INDIGO },
  totalLabel:  { fontSize: 11, color: MUTED },

  resetBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e8e4f8', alignItems: 'center', justifyContent: 'center',
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
