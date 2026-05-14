import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Linking, Alert, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

import Pushke from '../components/Pushke';
import CoinButton from '../components/CoinButton';
import AudioEngine from '../components/AudioEngine';

/* ── Constants ────────────────────────────────────────────────── */
const BIT_PHONE     = '0508100010';
const BIT_PHONE_INT = '972508100010'; // international format (no leading 0)

const COINS = [
  { value: 0.5, label: '½',  size: 'sm', freq: 1380 },
  { value: 1,   label: '1',  size: 'md', freq: 950  },
  { value: 5,   label: '5',  size: 'lg', freq: 620  },
  { value: 10,  label: '10', size: 'xl', freq: 420  },
];

/* ── Helpers ──────────────────────────────────────────────────── */
function formatAmount(n) {
  if (n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/* ── Falling coin SVG ─────────────────────────────────────────── */
function FallingCoinSvg({ coin, size = 42 }) {
  const r = size / 2;
  const isHalf = coin.value === 0.5;
  const gradId = 'fcGrad';
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0.2" y1="0" x2="0.8" y2="1">
          {isHalf ? (
            <>
              <Stop offset="0" stopColor="#e8e8e8" />
              <Stop offset="1" stopColor="#a0a0a0" />
            </>
          ) : (
            <>
              <Stop offset="0" stopColor="#ffe27a" />
              <Stop offset="1" stopColor="#c8860a" />
            </>
          )}
        </LinearGradient>
      </Defs>
      <Circle cx={r} cy={r} r={r - 1} fill={`url(#${gradId})`} />
      <SvgText
        x={r} y={r + 5}
        textAnchor="middle"
        fill={isHalf ? '#303030' : '#3a1800'}
        fontSize={size * 0.32}
        fontWeight="bold"
      >
        {coin.label}
      </SvgText>
    </Svg>
  );
}

/* ── Main Screen ──────────────────────────────────────────────── */
export default function HomeScreen() {
  const audioRef   = useRef(null);
  const pushkeRef  = useRef(null);

  const [total, setTotal]       = useState(0);
  const [coinCount, setCoinCount] = useState(0);
  const [lastCoin, setLastCoin]  = useState(null);
  const [showDonate, setShowDonate] = useState(false);

  // Falling coin animation values
  const dropY   = useRef(new Animated.Value(-80)).current;
  const dropOp  = useRef(new Animated.Value(0)).current;
  const dropX   = useRef(new Animated.Value(0)).current;

  /* ── Coin press ─────────────────────────────────────────────── */
  const handleCoin = useCallback((coin) => {
    // Update totals
    setTotal(prev => Math.round((prev + coin.value) * 10) / 10);
    setCoinCount(prev => prev + 1);
    setLastCoin(coin);

    // Haptic feedback — heavier coins get heavier rumble
    const hapticStyle = coin.value >= 5
      ? Haptics.ImpactFeedbackStyle.Heavy
      : coin.value >= 1
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(hapticStyle);

    // Synthesised metallic coin sound
    audioRef.current?.playCoin({ freq: coin.freq, value: coin.value });

    // Drop animation: coin falls into the slot
    dropY.setValue(-80);
    dropOp.setValue(1);
    dropX.setValue((Math.random() - 0.5) * 20); // slight random horizontal wiggle

    Animated.sequence([
      Animated.parallel([
        Animated.timing(dropY, {
          toValue: 40,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(dropX, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(dropOp, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dropY, dropOp, dropX]);

  /* ── Donate via Bit ─────────────────────────────────────────── */
  const handleDonate = useCallback(() => {
    if (total === 0) {
      Alert.alert('לא נבחר סכום', 'לחץ על מטבע כדי לתרום');
      return;
    }
    setShowDonate(true);
  }, [total]);

  const openBit = useCallback(() => {
    // Try Bit deep-link first; fall back to WhatsApp
    const amount = formatAmount(total);
    Linking.canOpenURL('bit://')
      .then(supported => {
        if (supported) {
          return Linking.openURL(`bit://pay?phone=${BIT_PHONE}&amount=${amount}`);
        }
        // WhatsApp fallback with pre-filled message
        const msg = `שלום! אני רוצה לתרום ${amount} ₪ לבית חב"ד קרית בורוכוב ותל גנים דרך Bit 🙏`;
        return Linking.openURL(
          `whatsapp://send?phone=${BIT_PHONE_INT}&text=${encodeURIComponent(msg)}`
        );
      })
      .catch(() => {
        Alert.alert(
          'שלח Bit ידנית',
          `פתח את אפליקציית Bit ושלח ${formatAmount(total)} ₪ למספר:\n📱 ${BIT_PHONE}`,
          [{ text: 'הבנתי', style: 'default' }]
        );
      });
  }, [total]);

  const resetAll = useCallback(() => {
    setTotal(0);
    setCoinCount(0);
    setLastCoin(null);
    setShowDonate(false);
  }, []);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.safe}>
      {/* Invisible audio engine */}
      <AudioEngine ref={audioRef} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>בית חב״ד</Text>
          <Text style={styles.headerSub}>קרית בורוכוב ותל גנים</Text>
        </View>

        {/* ── Pushke + falling coin overlay ── */}
        <View style={styles.pushkeWrap}>
          {/* Falling coin overlay (absolutely positioned over slot) */}
          {lastCoin && (
            <Animated.View
              style={[
                styles.fallingCoin,
                {
                  transform: [
                    { translateY: dropY },
                    { translateX: dropX },
                  ],
                  opacity: dropOp,
                },
              ]}
              pointerEvents="none"
            >
              <FallingCoinSvg coin={lastCoin} size={44} />
            </Animated.View>
          )}

          <Pushke ref={pushkeRef} width={220} height={300} />
        </View>

        {/* ── Running total ── */}
        <View style={styles.totalWrap}>
          <Text style={styles.totalAmount}>{formatAmount(total)} ₪</Text>
          <Text style={styles.totalLabel}>
            {coinCount === 0
              ? 'בחר מטבע לתרום'
              : `${coinCount} מטבע${coinCount === 1 ? '' : 'ות'} הוכנסו`}
          </Text>
        </View>

        {/* ── Coin buttons ── */}
        <View style={styles.coinsRow}>
          {COINS.map(coin => (
            <View key={coin.value} style={styles.coinWrap}>
              <CoinButton coin={coin} onPress={handleCoin} />
              <Text style={styles.coinValue}>{coin.label} ₪</Text>
            </View>
          ))}
        </View>

        {/* ── Donate button ── */}
        {!showDonate ? (
          <TouchableOpacity
            style={[styles.donateBtn, total === 0 && styles.donateBtnDisabled]}
            onPress={handleDonate}
            activeOpacity={0.8}
          >
            <Text style={styles.donateBtnText}>
              {total > 0 ? `תרום ${formatAmount(total)} ₪` : 'תרום'} 💙
            </Text>
          </TouchableOpacity>
        ) : (
          /* ── Donate modal card ── */
          <View style={styles.donateCard}>
            <Text style={styles.donateCardTitle}>תרומה דרך Bit</Text>
            <Text style={styles.donateCardAmount}>{formatAmount(total)} ₪</Text>
            <Text style={styles.donateCardPhone}>📱 {BIT_PHONE}</Text>
            <Text style={styles.donateCardHint}>
              לחץ על הכפתור — Bit תיפתח עם הסכום מלא
            </Text>

            <TouchableOpacity style={styles.bitBtn} onPress={openBit} activeOpacity={0.85}>
              <Text style={styles.bitBtnText}>פתח Bit ושלח</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDonate(false)}>
              <Text style={styles.cancelBtnText}>חזור להכנסת מטבעות</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
              <Text style={styles.resetBtnText}>אפס ותרום מחדש</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Footer note ── */}
        <Text style={styles.footer}>
          כל מטבע שמכניסים — הוא מצוה!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ───────────────────────────────────────────────────── */
const NAVY  = '#0A1628';
const BLUE  = '#1E40AF';
const GOLD  = '#F59E0B';
const LGOLD = '#FCD34D';
const WHITE = '#F0F4FF';
const MUTED = '#6B84B8';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: NAVY,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 32,
  },

  /* Header */
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginTop: 2,
  },

  /* Pushke */
  pushkeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 310,
    marginVertical: 8,
  },
  fallingCoin: {
    position: 'absolute',
    top: 10,
    zIndex: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  /* Total */
  totalWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 52,
    fontWeight: '900',
    color: GOLD,
    includeFontPadding: false,
  },
  totalLabel: {
    fontSize: 14,
    color: MUTED,
    marginTop: 2,
  },

  /* Coins row */
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  coinWrap: {
    alignItems: 'center',
    gap: 4,
  },
  coinValue: {
    fontSize: 11,
    color: MUTED,
  },

  /* Donate button */
  donateBtn: {
    backgroundColor: BLUE,
    paddingVertical: 15,
    paddingHorizontal: 48,
    borderRadius: 32,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  donateBtnDisabled: {
    backgroundColor: '#1a2a4a',
    shadowOpacity: 0,
    elevation: 0,
  },
  donateBtnText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },

  /* Donate card */
  donateCard: {
    backgroundColor: '#112244',
    borderRadius: 20,
    padding: 24,
    width: '88%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E40AF',
    marginBottom: 8,
  },
  donateCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 8,
  },
  donateCardAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: GOLD,
    marginBottom: 4,
  },
  donateCardPhone: {
    fontSize: 20,
    color: LGOLD,
    fontWeight: '600',
    marginBottom: 6,
  },
  donateCardHint: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  bitBtn: {
    backgroundColor: '#0070e0',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  bitBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    marginBottom: 4,
  },
  cancelBtnText: {
    color: MUTED,
    fontSize: 14,
  },
  resetBtn: {
    paddingVertical: 8,
  },
  resetBtnText: {
    color: '#4a6090',
    fontSize: 12,
  },

  /* Footer */
  footer: {
    color: '#334070',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
