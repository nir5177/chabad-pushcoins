import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Linking, Alert, Modal, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width: SW } = Dimensions.get('window');

const BIT_PHONE     = '0508100010';
const BIT_PHONE_INT = '972508100010';

function fmt(n) {
  if (n === 0) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/* ── Payment Method Button ── */
function PayMethod({ icon, title, subtitle, onPress, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.payMethod, disabled && styles.payMethodDisabled, style]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.75}
    >
      <Text style={[styles.payMethodIcon, disabled && { opacity: 0.35 }]}>{icon}</Text>
      <View style={styles.payMethodText}>
        <Text style={[styles.payMethodTitle, disabled && styles.payMethodTitleDisabled]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.payMethodSub, disabled && styles.payMethodSubDisabled]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {disabled
        ? <View style={styles.soonBadge}><Text style={styles.soonText}>בקרוב</Text></View>
        : <Text style={styles.payMethodArrow}>›</Text>
      }
    </TouchableOpacity>
  );
}

/* ── Main PaymentScreen (used as a Modal) ── */
export default function PaymentScreen({ visible, total, coinCount, onClose, onReset }) {
  const amount = fmt(total);

  /* ── Bit deep-link ── */
  const openBit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Primary: Bit app deep link (Android intent-style)
    Linking.openURL(`bit://send?phone=${BIT_PHONE}&amount=${amount}`)
      .catch(() =>
        // Secondary: Bit web universal link (opens Bit app via App Links if installed)
        Linking.openURL(`https://bitpay.co.il/transfer?phone=${BIT_PHONE}&amount=${amount}`)
          .catch(() => openWhatsApp())
      );
  }, [amount]);

  /* ── WhatsApp ── */
  const openWhatsApp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = `שלום! אני רוצה לתרום ${amount} ₪ לבית חב"ד קרית בורוכוב ותל גנים 🙏`;
    // wa.me universal link — always works, opens WhatsApp or browser
    Linking.openURL(`https://wa.me/${BIT_PHONE_INT}?text=${encodeURIComponent(msg)}`)
      .catch(() =>
        Alert.alert('שגיאה', 'לא ניתן לפתוח WhatsApp')
      );
  }, [amount]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset();
  }, [onReset]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>

        {/* ── Handle bar ── */}
        <View style={styles.handle} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>תשלום תרומה</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── Amount display ── */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>סכום לתרומה</Text>
          <Text style={styles.amountValue}>{amount} ₪</Text>
          <Text style={styles.coinCountText}>
            {coinCount} מטבע{coinCount === 1 ? '' : 'ות'} הוכנסו לפושקה
          </Text>
          <View style={styles.recipientRow}>
            <Text style={styles.recipientLabel}>נמען:</Text>
            <Text style={styles.recipientName}>בית חב״ד קרית בורוכוב ותל גנים</Text>
          </View>
        </View>

        {/* ── Section: Instant payment ── */}
        <Text style={styles.sectionTitle}>שלם עכשיו</Text>

        <View style={styles.methodsCard}>
          <PayMethod
            icon="💙"
            title="Bit"
            subtitle={`למספר ${BIT_PHONE}`}
            onPress={openBit}
          />
          <View style={styles.divider} />
          <PayMethod
            icon="💬"
            title="WhatsApp"
            subtitle="שלח הודעה לאישור התרומה"
            onPress={openWhatsApp}
          />
        </View>

        {/* ── Section: Future ── */}
        <Text style={styles.sectionTitle}>אמצעי תשלום נוספים</Text>

        <View style={styles.methodsCard}>
          <PayMethod
            icon="💳"
            title="כרטיס אשראי"
            subtitle="Cardcom / Tranzila"
            disabled
          />
          <View style={styles.divider} />
          <PayMethod
            icon="🏦"
            title="העברה בנקאית"
            subtitle="פרטי חשבון ישלחו בהמשך"
            disabled
          />
        </View>

        <Text style={styles.futureNote}>
          אמצעי תשלום נוספים יופעלו עם רישום העמותה 🕊
        </Text>

        {/* ── Reset ── */}
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>אפס ופתח מחדש</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </Modal>
  );
}

/* ── Styles ── */
const INDIGO = '#1e1b8a';
const GOLD   = '#F59E0B';
const MUTED  = '#7070a0';
const BG     = '#f0eefc';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#c0c0d0',
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#e0ddf4', alignItems: 'center', justifyContent: 'center',
  },
  closeText:   { fontSize: 14, color: MUTED, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: INDIGO },

  /* Amount card */
  amountCard: {
    backgroundColor: INDIGO, marginHorizontal: 16, borderRadius: 20,
    padding: 22, alignItems: 'center', marginBottom: 22,
    shadowColor: INDIGO, shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 8,
  },
  amountLabel:    { color: '#a0a8e0', fontSize: 13, marginBottom: 4 },
  amountValue:    { color: GOLD, fontSize: 58, fontWeight: '900', lineHeight: 64 },
  coinCountText:  { color: '#8090c8', fontSize: 13, marginTop: 2 },
  recipientRow:   { flexDirection: 'row', gap: 6, marginTop: 12, alignItems: 'center' },
  recipientLabel: { color: '#6070a8', fontSize: 12 },
  recipientName:  { color: '#c0ccf0', fontSize: 12, fontWeight: '600', textAlign: 'center', flex: 1 },

  /* Section titles */
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: MUTED,
    letterSpacing: 1, textTransform: 'uppercase',
    marginHorizontal: 20, marginBottom: 8,
  },

  /* Methods card */
  methodsCard: {
    backgroundColor: 'white', marginHorizontal: 16,
    borderRadius: 16, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#f0eef8', marginLeft: 60 },

  /* Payment method row */
  payMethod: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 12,
  },
  payMethodDisabled: { backgroundColor: '#fafafa' },
  payMethodIcon:  { fontSize: 26, width: 36, textAlign: 'center' },
  payMethodText:  { flex: 1 },
  payMethodTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a4a' },
  payMethodTitleDisabled: { color: '#b0b0c0' },
  payMethodSub:   { fontSize: 12, color: MUTED, marginTop: 1 },
  payMethodSubDisabled: { color: '#c0c0d0' },
  payMethodArrow: { fontSize: 22, color: '#c0c0d8', fontWeight: '300' },

  soonBadge: {
    backgroundColor: '#f0eef8', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  soonText: { fontSize: 11, color: MUTED, fontWeight: '600' },

  futureNote: {
    textAlign: 'center', color: '#a0a0c0', fontSize: 12,
    marginHorizontal: 30, marginBottom: 24,
  },

  /* Reset */
  resetBtn: { alignItems: 'center', paddingVertical: 8 },
  resetText: { color: '#b0b0c8', fontSize: 13 },
});
