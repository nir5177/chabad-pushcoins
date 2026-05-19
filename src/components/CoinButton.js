import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import Svg, {
  Circle, Ellipse, G, Path, Rect, Line,
  Text as SvgText, Defs, LinearGradient, RadialGradient, Stop, ClipPath,
} from 'react-native-svg';

/*
 * Real Israeli NIS coin proportions (actual diameter in mm):
 *   ½ ₪  — 26.0 mm  silver  (nickel-plated steel)
 *   ₪1   — 17.97mm  silver  (stainless steel)    ← smallest
 *   ₪2   — 22.0 mm  gold    (aluminum-bronze)
 *   ₪5   — 24.0 mm  bimetal (silver center + gold ring)
 *   ₪10  — 23.5 mm  bimetal (gold center + silver ring)
 *
 * Screen sizes scaled so ₪1 = 60px (base).
 */
const BASE = 60;
const MM   = { 0.5: 26.0, 1: 17.97, 2: 22.0, 5: 24.0, 10: 23.5 };
export const COIN_DIAM = Object.fromEntries(
  Object.entries(MM).map(([v, mm]) => [v, Math.round((mm / 17.97) * BASE)])
);
// Results: { 0.5: 87, 1: 60, 2: 73, 5: 80, 10: 78 }

/* Metal colour palettes */
const S = { // Silver / nickel
  hi: '#F0F2F4', mid: '#D0D2D6', lo: '#A8AAAE', edge: '#888A8E', dark: '#50525A', text: '#383A40',
};
const G2 = { // Gold / aluminum-bronze
  hi: '#F0CC60', mid: '#D4A020', lo: '#A87010', edge: '#806008', dark: '#502800', text: '#301800',
};

/* ─── Coin motifs ─────────────────────────────────────────────────────────── */

function Lyre({ r, c }) {   // ½ NIS — ancient lyre (כינור)
  const s = r * 0.52;
  return (
    <G>
      <Ellipse cx={0} cy={s * 0.28} rx={s * 0.32} ry={s * 0.20} fill="none" stroke={c} strokeWidth={s * 0.09} />
      <Line x1={-s*0.30} y1={s*0.12} x2={-s*0.30} y2={-s*0.54} stroke={c} strokeWidth={s*0.08} strokeLinecap="round"/>
      <Line x1={ s*0.30} y1={s*0.12} x2={ s*0.30} y2={-s*0.54} stroke={c} strokeWidth={s*0.08} strokeLinecap="round"/>
      <Line x1={-s*0.30} y1={-s*0.54} x2={s*0.30} y2={-s*0.54} stroke={c} strokeWidth={s*0.08} strokeLinecap="round"/>
      {[-0.18,-0.08,0,0.08,0.18].map((dx,i)=>(
        <Line key={i} x1={dx*s} y1={s*0.06} x2={dx*s} y2={-s*0.52} stroke={c} strokeWidth={s*0.045} opacity={0.8}/>
      ))}
    </G>
  );
}

function Lily({ r, c }) {   // ₪1 — lily / שושן
  const s = r * 0.48;
  return (
    <G>
      <Line x1={0} y1={s*0.1} x2={0} y2={s*0.65} stroke={c} strokeWidth={s*0.1} strokeLinecap="round"/>
      <Ellipse cx={0} cy={-s*0.12} rx={s*0.12} ry={s*0.44} fill={c} opacity={0.9}/>
      <Ellipse cx={-s*0.28} cy={-s*0.04} rx={s*0.11} ry={s*0.36} fill={c} opacity={0.8} transform={`rotate(-38,${-s*0.28},${-s*0.04})`}/>
      <Ellipse cx={ s*0.28} cy={-s*0.04} rx={s*0.11} ry={s*0.36} fill={c} opacity={0.8} transform={`rotate(38,${s*0.28},${-s*0.04})`}/>
      <Ellipse cx={-s*0.20} cy={ s*0.22} rx={s*0.09} ry={s*0.28} fill={c} opacity={0.65} transform={`rotate(22,${-s*0.2},${s*0.22})`}/>
      <Ellipse cx={ s*0.20} cy={ s*0.22} rx={s*0.09} ry={s*0.28} fill={c} opacity={0.65} transform={`rotate(-22,${s*0.2},${s*0.22})`}/>
    </G>
  );
}

function Cornucopia({ r, c }) {  // ₪2 — two cornucopias
  const s = r * 0.50;
  return (
    <G>
      {/* Left horn */}
      <Path d={`M${-s*0.08},${-s*0.5} Q${-s*0.6},${-s*0.2} ${-s*0.52},${s*0.38} Q${-s*0.28},${s*0.5} ${-s*0.05},${s*0.08} Z`} fill={c} opacity={0.8}/>
      <Circle cx={-s*0.6}  cy={-s*0.36} r={s*0.1}  fill={c} opacity={0.85}/>
      <Circle cx={-s*0.68} cy={-s*0.14} r={s*0.08} fill={c} opacity={0.7}/>
      {/* Right horn (mirrored) */}
      <Path d={`M${s*0.08},${-s*0.5} Q${s*0.6},${-s*0.2} ${s*0.52},${s*0.38} Q${s*0.28},${s*0.5} ${s*0.05},${s*0.08} Z`} fill={c} opacity={0.8}/>
      <Circle cx={s*0.6}  cy={-s*0.36} r={s*0.1}  fill={c} opacity={0.85}/>
      <Circle cx={s*0.68} cy={-s*0.14} r={s*0.08} fill={c} opacity={0.7}/>
    </G>
  );
}

function Capital({ r, c }) {  // ₪5 — Ionic capital with palm leaves
  const s = r * 0.52;
  return (
    <G>
      <Rect x={-s*0.55} y={s*0.30} width={s*1.10} height={s*0.22} rx={s*0.03} fill={c} opacity={0.9}/>
      <Rect x={-s*0.42} y={s*0.10} width={s*0.84} height={s*0.22} rx={s*0.03} fill={c} opacity={0.85}/>
      <Ellipse cx={-s*0.32} cy={-s*0.05} rx={s*0.18} ry={s*0.18} fill="none" stroke={c} strokeWidth={s*0.07} opacity={0.9}/>
      <Ellipse cx={ s*0.32} cy={-s*0.05} rx={s*0.18} ry={s*0.18} fill="none" stroke={c} strokeWidth={s*0.07} opacity={0.9}/>
      {[-0.48,-0.24,0,0.24,0.48].map((dx,i) => (
        <Path key={i} d={`M${dx*s},${-s*0.06} Q${dx*s - s*0.08},${-s*0.5} ${dx*s},${-s*0.60}`}
          fill="none" stroke={c} strokeWidth={s*0.06} strokeLinecap="round" opacity={0.8}/>
      ))}
    </G>
  );
}

function PalmTree({ r, c }) {  // ₪10 — date palm (תמר)
  const s = r * 0.48;
  return (
    <G>
      <Rect x={-s*0.07} y={-s*0.55} width={s*0.14} height={s*1.10} rx={s*0.04} fill={c}/>
      {[[-0.42,-0.3,35],[-0.55,-0.1,20],[0.42,-0.3,-35],[0.55,-0.1,-20]].map(([dx,dy,rot],i)=>(
        <Ellipse key={i} cx={dx*s} cy={dy*s} rx={s*0.20} ry={s*0.08}
          fill={c} opacity={0.85} transform={`rotate(${rot},${dx*s},${dy*s})`}/>
      ))}
      {[[-0.28,-0.44,25],[-0.22,-0.24,12],[0.28,-0.44,-25],[0.22,-0.24,-12]].map(([dx,dy,rot],i)=>(
        <Ellipse key={i} cx={dx*s} cy={dy*s} rx={s*0.15} ry={s*0.06}
          fill={c} opacity={0.7} transform={`rotate(${rot},${dx*s},${dy*s})`}/>
      ))}
      <Ellipse cx={0} cy={s*0.44} rx={s*0.3} ry={s*0.08} fill={c} opacity={0.8}/>
    </G>
  );
}

/* ─── Core coin renderer ──────────────────────────────────────────────────── */
function CoinSVG({ value }) {
  const diam = COIN_DIAM[value];
  const R    = diam / 2;
  const id   = `k${String(value).replace('.','_')}`;

  const isBimetal     = value === 5 || value === 10;
  const silverCenter  = value === 5;   // ₪5: silver center, gold ring
  const outerIsGold   = value === 5;   // ₪5 has gold outer ring
  const isGold        = value === 2;   // pure gold coin
  const isSilver      = !isGold && !isBimetal; // ½, 1

  const outerPal = (outerIsGold || isGold) ? G2 : S;
  const innerPal = silverCenter ? S : G2;
  const motifPal = isBimetal ? (silverCenter ? S : G2) : (isGold ? G2 : S);
  const motifC   = motifPal.dark;

  const innerR   = R * 0.575;

  return (
    <Svg width={diam} height={diam} viewBox={`0 0 ${diam} ${diam}`}>
      <Defs>
        {/* Outer face — radial gradient simulates curved metallic surface */}
        <RadialGradient id={`${id}f`} cx="36%" cy="30%" r="72%">
          <Stop offset="0%"   stopColor={outerPal.hi} />
          <Stop offset="28%"  stopColor={outerPal.mid} />
          <Stop offset="65%"  stopColor={outerPal.lo} />
          <Stop offset="100%" stopColor={outerPal.edge} />
        </RadialGradient>
        {/* Inner disc (bimetal) */}
        {isBimetal && (
          <RadialGradient id={`${id}i`} cx="36%" cy="30%" r="72%">
            <Stop offset="0%"   stopColor={innerPal.hi} />
            <Stop offset="30%"  stopColor={innerPal.mid} />
            <Stop offset="70%"  stopColor={innerPal.lo} />
            <Stop offset="100%" stopColor={innerPal.edge} />
          </RadialGradient>
        )}
        {/* Specular highlight */}
        <RadialGradient id={`${id}s`} cx="28%" cy="22%" r="42%">
          <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="50%"  stopColor="#FFFFFF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <ClipPath id={`${id}cl`}>
          <Circle cx={R} cy={R} r={R - 1} />
        </ClipPath>
        {isBimetal && (
          <ClipPath id={`${id}cli`}>
            <Circle cx={R} cy={R} r={innerR - 1} />
          </ClipPath>
        )}
      </Defs>

      {/* Drop shadow */}
      <Ellipse cx={R + 2.5} cy={R + 3.5} rx={R * 0.90} ry={R * 0.90} fill="#000" opacity={0.30} />

      {/* Outer coin body */}
      <Circle cx={R} cy={R} r={R - 1} fill={`url(#${id}f)`} />

      {/* Milled rim (serrations) */}
      {Array.from({ length: 80 }).map((_, i) => {
        const a = (i / 80) * 2 * Math.PI;
        const x = R + (R - 1.2) * Math.cos(a);
        const y = R + (R - 1.2) * Math.sin(a);
        return i % 2 === 0
          ? <Circle key={i} cx={x} cy={y} r={0.8} fill={outerPal.dark} opacity={0.55} />
          : null;
      })}

      {/* Raised inner platform */}
      <Circle cx={R} cy={R} r={R - 5} fill={`url(#${id}f)`} />
      <Circle cx={R} cy={R} r={R - 5} fill="none" stroke={outerPal.edge} strokeWidth={0.7} opacity={0.4} />

      {/* Bimetallic separator + inner disc */}
      {isBimetal && (
        <>
          <Circle cx={R} cy={R} r={innerR + 1.5} fill={outerPal.dark} opacity={0.5} />
          <Circle cx={R} cy={R} r={innerR} fill={`url(#${id}i)`} />
          <Circle cx={R} cy={R} r={innerR} fill="none" stroke={innerPal.edge} strokeWidth={0.7} />
        </>
      )}

      {/* Motif — rendered at coin center */}
      <G transform={`translate(${R},${R - R * 0.12})`}>
        {/* Emboss shadow (tiny offset for depth) */}
        <G transform="translate(0.6,0.8)" opacity={0.35}>
          {value === 0.5 && <Lyre       r={R} c={outerPal.dark} />}
          {value === 1   && <Lily       r={R} c={motifC} />}
          {value === 2   && <Cornucopia r={R} c={motifC} />}
          {value === 5   && <Capital    r={R} c={motifC} />}
          {value === 10  && <PalmTree   r={R} c={motifC} />}
        </G>
        {/* Main motif */}
        {value === 0.5 && <Lyre       r={R} c={S.dark} />}
        {value === 1   && <Lily       r={R} c={motifC} />}
        {value === 2   && <Cornucopia r={R} c={motifC} />}
        {value === 5   && <Capital    r={R} c={motifC} />}
        {value === 10  && <PalmTree   r={R} c={motifC} />}
      </G>

      {/* "מדינת ישראל" arc text */}
      <SvgText
        x={R} y={R * 0.32}
        textAnchor="middle"
        fontSize={R * 0.19}
        fontFamily="Arial"
        fill={isBimetal ? outerPal.dark : motifPal.dark}
        opacity={0.75}
      >
        מדינת ישראל
      </SvgText>

      {/* Denomination number */}
      <SvgText
        x={R} y={R * 1.78}
        textAnchor="middle"
        fontSize={R * 0.34}
        fontWeight="900"
        fontFamily="Arial"
        fill={motifPal.dark}
      >
        {value === 0.5 ? '½' : value}
      </SvgText>
      {/* ₪ symbol */}
      <SvgText
        x={R} y={R * 1.96}
        textAnchor="middle"
        fontSize={R * 0.20}
        fontWeight="700"
        fontFamily="Arial"
        fill={motifPal.dark}
        opacity={0.8}
      >
        ₪
      </SvgText>

      {/* Specular highlight overlay */}
      <Circle cx={R} cy={R} r={R - 1} fill={`url(#${id}s)`} />
    </Svg>
  );
}

/* ─── Pressable coin button ───────────────────────────────────────────────── */
export default function CoinButton({ coin, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const diam  = COIN_DIAM[coin.value] || 72;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 60, bounciness: 4 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 14 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }], width: diam, height: diam }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => onPress && onPress(coin)}
        hitSlop={10}
        style={styles.pressable}
      >
        <CoinSVG value={coin.value} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { alignItems: 'center', justifyContent: 'center' },
});
