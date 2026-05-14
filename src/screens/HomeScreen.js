import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import Pushke from '../components/Pushke';
import CoinButton from '../components/CoinButton';
import AudioEngine from '../components/AudioEngine';
import PaymentScreen from './PaymentScreen';

/* ── Constants ──────────────────────────────────────────────── */
const { width: SW } = Dimensions.get('window');

const COINS = [
  { value: 0.5, label: '½ ₪',  freq: 1380 },
  { value: 1,   label: '₪1',   freq: 950  },
  { value: 2,   label: '₪2',   freq: 750  },
  { value: 5,   label: '₪5',   freq: 620  },
  { value: 10,  label: '₪10',  freq: 420  },
];

const COIN_CARD_W = SW * 0.52;   // width of each carousel card
const COIN_PAD    = (SW - COIN_CARD_W) / 2; // centering padding

/* ── helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  if (n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function HomeScreen() {
  const audioRef    = useRef(null);
  const flatRef     = useRef(null);
  const scrollX     = useRef(new Animated.Value(0)).current;

  // Flying coin animation values
  const coinY    = useRef(new Animated.Value(0)).current;
  const coinX    = useRef(new Animated.Value(0)).current;
  const coinScale= useRef(new Animated.Value(1)).current;
  const coinOp   = useRef(new Animated.Value(0)).current;
  const arrowBob = useRef(new Animated.Value(0)).current;

  const [total,     setTotal]     = useState(0);
  const [coinCount, setCoinCount] = useState(0);
  const [lastCoin,  setLastCoin]  = useState(COINS[2]); // default ₪5
  const [showDonate,setShowDonate]= useState(false);

  // Bounce the arrow continuously
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBob, { toValue: 10, duration: 600, useNativeDriver: true }),
        Animated.timing(arrowBob, { toValue: 0,  duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  /* ── Coin press ─────────────────────────────────────────────── */
  const handleCoin = useCallback((coin) => {
    setTotal(prev => Math.round((prev + coin.value) * 10) / 10);
    setCoinCount(prev => prev + 1);
    setLastCoin(coin);

    // Haptic
    Haptics.impactAsync(
      coin.value >= 5
        ? Haptics.ImpactFeedbackStyle.Heavy
        : coin.value >= 1
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
    );

    // Sound
    audioRef.current?.playCoin({ freq: coin.freq, value: coin.value });

    // Coin fly-into-slot animation:
    // coin starts at center of carousel, moves up & into pushke slot
    coinOp.setValue(1);
    coinScale.setValue(1);
    coinY.setValue(0);
    coinX.setValue((Math.random() - 0.5) * 20);

    Animated.parallel([
      Animated.timing(coinY, {
        toValue: -200,          // flies upward toward pushke slot
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(coinX, {
        toValue: 0,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(coinScale, {
          toValue: 0.15,         // shrinks as it enters the slot
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(coinOp, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [coinY, coinX, coinScale, coinOp]);

  /* ── Donate ──────────────────────────────────────────────────── */
  const handleDonate = useCallback(() => {
    if (total === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDonate(true);
  }, [total]);

  const reset = useCallback(() => {
    setTotal(0); setCoinCount(0); setShowDonate(false);
  }, []);

  /* ── Carousel item ───────────────────────────────────────────── */
  const renderCoin = useCallback(({ item, index }) => {
    // Parallax scale: center coin is full size, adjacent are smaller
    const inputRange = [
      (index - 1.2) * COIN_CARD_W,
      index         * COIN_CARD_W,
      (index + 1.2) * COIN_CARD_W,
    ];
    const cardScale = scrollX.interpolate({
      inputRange, outputRange: [0.78, 1, 0.78], extrapolate: 'clamp',
    });
    const cardOp = scrollX.interpolate({
      inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[
        styles.coinCard,
        { transform: [{ scale: cardScale }], opacity: cardOp },
      ]}>
        <CoinButton coin={item} onPress={handleCoin} />
        <Text style={styles.coinCardLabel}>{item.label}</Text>
      </Animated.View>
    );
  }, [scrollX, handleCoin]);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.safe}>
      <AudioEngine ref={audioRef} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>בית חב״ד</Text>
        <Text style={styles.headerSub}>קרית בורוכוב ותל גנים</Text>
      </View>

      <Text style={styles.question}>כמה תרצה לתרום?</Text>

      {/* ── Coin Carousel ── */}
      <View style={styles.carouselWrap}>
        <Animated.FlatList
          ref={flatRef}
          data={COINS}
          keyExtractor={c => String(c.value)}
          renderItem={renderCoin}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={COIN_CARD_W}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: COIN_PAD }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          initialScrollIndex={2}   // start on ₪5
          getItemLayout={(_, i) => ({ length: COIN_CARD_W, offset: COIN_CARD_W * i, index: i })}
        />

        {/* Flying coin overlay */}
        {lastCoin && (
          <Animated.View
            style={[
              styles.flyingCoin,
              {
                transform: [
                  { translateY: coinY },
                  { translateX: coinX },
                  { scale: coinScale },
                ],
                opacity: coinOp,
              },
            ]}
            pointerEvents="none"
          >
            <CoinButton coin={lastCoin} onPress={() => {}} />
          </Animated.View>
        )}
      </View>

      {/* ── Bouncing arrow ── */}
      <Animated.Text
        style={[styles.arrow, { transform: [{ translateY: arrowBob }] }]}
      >
        ↓
      </Animated.Text>

      {/* ── Pushke ── */}
      <View style={styles.pushkeWrap}>
        <Pushke width={SW * 0.95} height={SW * 0.78} />
      </View>

      {/* ── Total + Donate ── */}
      <View style={styles.bottomBar}>
        <View style={styles.totalWrap}>
          <Text style={styles.totalAmount}>{fmt(total)} ₪</Text>
          <Text style={styles.totalLabel}>
            {coinCount === 0 ? 'בחר מטבע' : `${coinCount} מטבע${coinCount === 1 ? '' : 'ות'}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.donateBtn, total === 0 && styles.donateBtnOff]}
          onPress={handleDonate}
          activeOpacity={0.85}
        >
          <Text style={styles.donateBtnText}>
            {total > 0 ? `תרום ${fmt(total)} ₪` : 'תרום'} 💙
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Payment Modal ── */}
      <PaymentScreen
        visible={showDonate}
        total={total}
        coinCount={coinCount}
        onClose={() => setShowDonate(false)}
        onReset={reset}
      />
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */
const BG     = '#eeeaf8';
const INDIGO = '#1e1b8a';
const MUTED  = '#7070a0';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  /* Header */
  header:      { alignItems: 'center', paddingTop: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: INDIGO, letterSpacing: 0.5 },
  headerSub:   { fontSize: 12, color: MUTED, marginTop: 2 },

  /* Question */
  question: {
    textAlign: 'center', fontSize: 18, fontWeight: '700',
    color: '#2a2060', marginTop: 6, marginBottom: 4,
  },

  /* Carousel */
  carouselWrap: { height: 140, position: 'relative' },
  coinCard:     {
    width: COIN_CARD_W,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCardLabel: { color: MUTED, fontSize: 12, marginTop: 4 },

  /* Flying coin */
  flyingCoin: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    zIndex: 50,
  },

  /* Arrow */
  arrow: {
    textAlign: 'center', fontSize: 28, color: '#4040b0',
    marginVertical: 2, opacity: 0.7,
  },

  /* Pushke */
  pushkeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4, marginBottom: 8,
    flexShrink: 0,
  },

  /* Bottom bar */
  bottomBar:   {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10, gap: 12,
  },
  totalWrap:   { flex: 1 },
  totalAmount: { fontSize: 32, fontWeight: '900', color: INDIGO },
  totalLabel:  { fontSize: 12, color: MUTED },

  /* Donate button */
  donateBtn: {
    backgroundColor: INDIGO, paddingVertical: 14,
    paddingHorizontal: 22, borderRadius: 28,
    shadowColor: INDIGO, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  donateBtnOff: { backgroundColor: '#b0b0c8', shadowOpacity: 0 },
  donateBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

});
