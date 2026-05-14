import React, { useRef, useState } from 'react';
import { Pressable, Animated, StyleSheet, View, Image } from 'react-native';
import { COIN_IMAGES } from '../data/coinImages';
import Svg, {
  Circle, Ellipse, G, Path, Rect,
  Text as SvgText, Defs, LinearGradient, Stop, Filter,
  FeGaussianBlur, FeMerge, FeMergeNode, FeTurbulence, FeColorMatrix,
  Line,
} from 'react-native-svg';

/*
 * Realistic Israeli New Shekel coins.
 * Each coin matches the actual size ratios, colours and motifs
 * of the corresponding ILS denomination.
 *
 * Denominations supported:
 *   0.5  — ½ ₪  silver  (nickel-clad steel)   lyre
 *   1    — ₪1   gold    (aluminum-bronze)      lily
 *   2    — ₪2   gold    (aluminum-bronze)       cornucopia
 *   5    — ₪5   silver  (nickel-clad steel)    pomegranate
 *   10   — ₪10  bimetal (gold center + silver ring)  menorah
 */

/* ── Coin diameters (screen px) ─────────────────────────────── */
const DIAM = { 0.5: 70, 1: 80, 2: 88, 5: 96, 10: 108 };

/* ── Colour palettes ─────────────────────────────────────────── */
const SILVER = {
  hi:   '#f0f0f0', mid:  '#d0d0d0', lo:   '#a8a8a8',
  edge: '#909090', dark: '#606060', text: '#303030',
};
const GOLD = {
  hi:   '#ffe880', mid:  '#e8a820', lo:   '#b07010',
  edge: '#906010', dark: '#603800', text: '#2a1000',
};

/* ── Shared rim serration helper ─────────────────────────────── */
function MilledRim({ cx, cy, r, color, count = 60 }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    dots.push(
      <Circle key={i} cx={x} cy={y} r={0.9}
        fill={i % 2 === 0 ? color : 'transparent'} />
    );
  }
  return <G>{dots}</G>;
}

/* ── Lyre (½ shekel) ─────────────────────────────────────────── */
function Lyre({ cx, cy, s }) {
  return (
    <G transform={`translate(${cx},${cy})`}>
      {/* Sound box */}
      <Ellipse cx={0} cy={s * 0.18} rx={s * 0.28} ry={s * 0.18} fill="none" stroke={SILVER.dark} strokeWidth={s * 0.04} />
      {/* Yoke arms */}
      <Line x1={-s * 0.28} y1={s * 0.04} x2={-s * 0.28} y2={-s * 0.5} stroke={SILVER.dark} strokeWidth={s * 0.04} strokeLinecap="round"/>
      <Line x1={ s * 0.28} y1={s * 0.04} x2={ s * 0.28} y2={-s * 0.5} stroke={SILVER.dark} strokeWidth={s * 0.04} strokeLinecap="round"/>
      {/* Crossbar */}
      <Line x1={-s * 0.28} y1={-s * 0.5} x2={s * 0.28} y2={-s * 0.5} stroke={SILVER.dark} strokeWidth={s * 0.04} strokeLinecap="round"/>
      {/* Strings (5) */}
      {[-0.18, -0.09, 0, 0.09, 0.18].map((dx, i) => (
        <Line key={i}
          x1={dx * s} y1={-s * 0.02}
          x2={dx * s} y2={-s * 0.48}
          stroke={SILVER.dark} strokeWidth={s * 0.025} opacity={0.7} />
      ))}
    </G>
  );
}

/* ── Lily / iris (₪1) ───────────────────────────────────────── */
function Lily({ cx, cy, s, color }) {
  const c = color || GOLD.dark;
  return (
    <G transform={`translate(${cx},${cy})`}>
      {/* Stem */}
      <Line x1={0} y1={s * 0.1} x2={0} y2={s * 0.5} stroke={c} strokeWidth={s * 0.05} strokeLinecap="round"/>
      {/* 3 upper petals */}
      <Ellipse cx={0}          cy={-s * 0.15} rx={s * 0.09} ry={s * 0.32} fill={c} opacity={0.85}/>
      <Ellipse cx={-s * 0.22}  cy={-s * 0.05} rx={s * 0.09} ry={s * 0.28} fill={c} opacity={0.75} transform={`rotate(-35,${-s*0.22},${-s*0.05})`}/>
      <Ellipse cx={ s * 0.22}  cy={-s * 0.05} rx={s * 0.09} ry={s * 0.28} fill={c} opacity={0.75} transform={`rotate(35,${s*0.22},${-s*0.05})`}/>
      {/* 3 lower petals (sepals) */}
      <Ellipse cx={-s * 0.16}  cy={ s * 0.18} rx={s * 0.07} ry={s * 0.22} fill={c} opacity={0.6} transform={`rotate(20,${-s*0.16},${s*0.18})`}/>
      <Ellipse cx={ s * 0.16}  cy={ s * 0.18} rx={s * 0.07} ry={s * 0.22} fill={c} opacity={0.6} transform={`rotate(-20,${s*0.16},${s*0.18})`}/>
    </G>
  );
}

/* ── Cornucopia / horn (₪2) ──────────────────────────────────── */
function Cornucopia({ cx, cy, s, color }) {
  const c = color || GOLD.dark;
  return (
    <G transform={`translate(${cx},${cy})`}>
      {/* Horn body */}
      <Path
        d={`M${-s*0.05},${-s*0.4} Q${s*0.5},${-s*0.1} ${s*0.38},${s*0.38} Q${s*0.1},${s*0.5} ${-s*0.35},${s*0.1} Z`}
        fill={c} opacity={0.8}
      />
      {/* Horn opening highlight */}
      <Ellipse cx={-s*0.18} cy={-s*0.22} rx={s*0.08} ry={s*0.16} fill={c} opacity={0.5} transform={`rotate(-30,${-s*0.18},${-s*0.22})`}/>
      {/* Fruits spilling out */}
      <Circle cx={-s*0.28} cy={-s*0.38} r={s*0.1} fill={c} opacity={0.85}/>
      <Circle cx={-s*0.42} cy={-s*0.24} r={s*0.08} fill={c} opacity={0.7}/>
      <Circle cx={-s*0.38} cy={-s*0.42} r={s*0.07} fill={c} opacity={0.65}/>
      {/* Scroll at tip */}
      <Circle cx={s*0.36} cy={s*0.32} r={s*0.07} fill="none" stroke={c} strokeWidth={s*0.03} opacity={0.7}/>
    </G>
  );
}

/* ── Pomegranate (₪5) ────────────────────────────────────────── */
function Pomegranate({ cx, cy, s, color }) {
  const c = color || SILVER.dark;
  return (
    <G transform={`translate(${cx},${cy})`}>
      {/* Crown (calyx) */}
      {[-0.16, -0.06, 0.06, 0.16].map((dx, i) => (
        <Path key={i}
          d={`M${dx*s},${-s*0.12} L${dx*s - s*0.04},${-s*0.28} L${dx*s + s*0.04},${-s*0.28} Z`}
          fill={c} opacity={0.8}
        />
      ))}
      {/* Round fruit body */}
      <Circle cx={0} cy={s * 0.16} r={s * 0.36} fill={c} opacity={0.8} />
      <Circle cx={0} cy={s * 0.16} r={s * 0.28} fill="none" stroke={c} strokeWidth={s*0.03} opacity={0.4}/>
      {/* Stem */}
      <Line x1={0} y1={-s*0.12} x2={0} y2={-s*0.5} stroke={c} strokeWidth={s*0.04} strokeLinecap="round"/>
      {/* Leaf */}
      <Ellipse cx={s*0.1} cy={-s*0.32} rx={s*0.07} ry={s*0.14} fill={c} opacity={0.6} transform={`rotate(30,${s*0.1},${-s*0.32})`}/>
    </G>
  );
}

/* ── Menorah (₪10) ───────────────────────────────────────────── */
function Menorah({ cx, cy, s, color }) {
  const c = color || GOLD.dark;
  const arms = [
    [-s*0.3, s*0.1, s*0.3],
    [ s*0.18, s*0.1, s*0.3],
    [-s*0.46, s*0.18, s*0.2],
    [ s*0.34, s*0.18, s*0.2],
  ];
  return (
    <G transform={`translate(${cx},${cy})`}>
      <Rect x={-s*0.04} y={-s*0.42} width={s*0.08} height={s*0.82} rx={s*0.02} fill={c}/>
      <Rect x={-s*0.5} y={s*0.06} width={s} height={s*0.08} rx={s*0.02} fill={c} opacity={0.8}/>
      <Rect x={-s*0.46} y={s*0.38} width={s*0.92} height={s*0.08} rx={s*0.02} fill={c}/>
      {arms.map(([x, y, h], i) => (
        <Rect key={i} x={x} y={y} width={s*0.08} height={h} rx={s*0.02} fill={c} opacity={0.9}/>
      ))}
      {[-s*0.48,-s*0.32,-s*0.14, 0, s*0.12, s*0.28, s*0.44].map((x, i) => (
        <Ellipse key={i} cx={x+s*0.04} cy={i===3 ? -s*0.44 : (i<3 ? s*0.06+(3-i)*s*0.04 : s*0.06+(i-3)*s*0.04)} rx={s*0.05} ry={s*0.08} fill={c} opacity={0.9}/>
      ))}
    </G>
  );
}

/* ── Single coin SVG renderer ───────────────────────────────── */
function CoinFace({ value, diam }) {
  const r = diam / 2;
  const cx = r, cy = r;
  const isBimetal = value === 10;
  const isSilver  = value === 0.5 || value === 5;
  const pal       = isSilver ? SILVER : GOLD;

  const faceId   = `face_${value}`;
  const edgeId   = `edge_${value}`;
  const innerFId = `innerF_${value}`;

  const innerR   = isBimetal ? r * 0.58 : 0; // bimetal inner circle radius
  const outerPal = isBimetal ? SILVER : pal;
  const innerPal = isBimetal ? GOLD   : pal;

  // Symbol scale relative to coin face
  const symScale = r * 0.36;

  // Denomination string
  const denomStr = value === 0.5 ? '½' : String(value);
  const subLabel = value === 0.5 ? 'חצי שקל' : value === 1 ? 'שקל חדש' : value === 2 ? 'שקלים חדשים' : value === 5 ? 'שקלים חדשים' : 'שקלים חדשים';

  return (
    <Svg width={diam} height={diam} viewBox={`0 0 ${diam} ${diam}`}>
      <Defs>
        {/* Outer face gradient */}
        <LinearGradient id={faceId} x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0"    stopColor={outerPal.hi} />
          <Stop offset="0.3"  stopColor={outerPal.mid} />
          <Stop offset="0.7"  stopColor={outerPal.lo} />
          <Stop offset="1"    stopColor={outerPal.edge} />
        </LinearGradient>
        {/* Edge (depth ring) */}
        <LinearGradient id={edgeId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"    stopColor={outerPal.mid} />
          <Stop offset="1"    stopColor={outerPal.dark} />
        </LinearGradient>
        {/* Inner circle gradient (bimetal only) */}
        {isBimetal && (
          <LinearGradient id={innerFId} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0"   stopColor={innerPal.hi} />
            <Stop offset="0.4" stopColor={innerPal.mid} />
            <Stop offset="1"   stopColor={innerPal.lo} />
          </LinearGradient>
        )}
      </Defs>

      {/* ── Coin depth (shadow ring) ── */}
      <Circle cx={cx} cy={cy + r * 0.04} r={r - 0.5} fill={`url(#${edgeId})`} />

      {/* ── Outer coin face ── */}
      <Circle cx={cx} cy={cy} r={r - 1.5} fill={`url(#${faceId})`} />

      {/* ── Milled rim (serrations) ── */}
      <MilledRim cx={cx} cy={cy} r={r - 2} color={outerPal.dark} count={72} />

      {/* ── Inner face (rim inset) ── */}
      <Circle cx={cx} cy={cy} r={r - 5} fill={`url(#${faceId})`} />
      <Circle cx={cx} cy={cy} r={r - 5} fill="none" stroke={outerPal.edge} strokeWidth={0.8} opacity={0.5} />

      {/* ── Bimetallic inner circle ── */}
      {isBimetal && (
        <>
          <Circle cx={cx} cy={cy} r={innerR + 1} fill={outerPal.dark} opacity={0.4} />
          <Circle cx={cx} cy={cy} r={innerR} fill={`url(#${innerFId})`} />
          <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke={innerPal.edge} strokeWidth={0.8} />
        </>
      )}

      {/* ── Denomination symbol ── */}
      {value === 0.5 && <Lyre        cx={cx} cy={cy - r*0.1} s={symScale} />}
      {value === 1   && <Lily        cx={cx} cy={cy - r*0.06} s={symScale} color={GOLD.dark} />}
      {value === 2   && <Cornucopia  cx={cx} cy={cy - r*0.04} s={symScale} color={GOLD.dark} />}
      {value === 5   && <Pomegranate cx={cx} cy={cy - r*0.08} s={symScale} color={SILVER.dark} />}
      {value === 10  && <Menorah     cx={cx} cy={cy - r*0.08} s={symScale * 0.8} color={GOLD.dark} />}

      {/* ── Denomination numeral ── */}
      <SvgText
        x={cx} y={cy + r * 0.62}
        textAnchor="middle"
        fill={isBimetal ? GOLD.dark : pal.dark}
        fontSize={r * 0.38}
        fontWeight="bold"
        fontFamily="Arial"
      >
        {denomStr}
      </SvgText>

      {/* ── "שקלים חדשים" label ── */}
      <SvgText
        x={cx} y={cy + r * 0.84}
        textAnchor="middle"
        fill={isBimetal ? GOLD.dark : pal.dark}
        fontSize={r * 0.16}
        fontFamily="Arial"
        opacity={0.75}
      >
        {subLabel}
      </SvgText>

      {/* ── Glare highlight (top-left crescent) ── */}
      <Ellipse
        cx={cx - r * 0.22}
        cy={cy - r * 0.3}
        rx={r * 0.28}
        ry={r * 0.14}
        fill="white"
        opacity={0.18}
        transform={`rotate(-35,${cx},${cy})`}
      />
    </Svg>
  );
}

/* ── Pressable CoinButton ────────────────────────────────────── */
export default function CoinButton({ coin, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const diam  = DIAM[coin.value] || 80;
  const [imgFailed, setImgFailed] = useState(false);
  const photoUri = COIN_IMAGES[coin.value];

  function pressIn() {
    Animated.spring(scale, { toValue: 0.87, useNativeDriver: true, speed: 60, bounciness: 3 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 12 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => onPress(coin)}
        accessibilityRole="button"
        accessibilityLabel={`הכנס מטבע ${coin.label}`}
        hitSlop={10}
        style={styles.pressable}
      >
        <View style={{ width: diam, height: diam }}>
          {/* SVG fallback always rendered underneath — visible if photo fails */}
          <CoinFace value={coin.value} diam={diam} />

          {/* Real coin photo overlay (circular crop with drop shadow) */}
          {photoUri && !imgFailed && (
            <Image
              source={{ uri: photoUri }}
              style={[styles.photo, {
                width: diam, height: diam, borderRadius: diam / 2,
              }]}
              onError={() => setImgFailed(true)}
              resizeMode="cover"
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { alignItems: 'center', justifyContent: 'center' },
  photo: {
    position: 'absolute', top: 0, left: 0,
    shadowColor: '#000', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 5,
    elevation: 4,
  },
});
