import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect, Circle, Path, Text as SvgText, Defs, LinearGradient, Stop,
  G, Ellipse, Line,
} from 'react-native-svg';

/**
 * קופת צדקה — Chabad blue metal charity box (pushke).
 * Exposes a `shakeCoin()` method via ref (called when a coin is pressed).
 */
const Pushke = forwardRef(function Pushke({ width = 220, height = 300 }, ref) {
  // No animation ref needed here; parent handles the falling coin
  useImperativeHandle(ref, () => ({
    shakeCoin() {/* hook for parent to trigger extra effects if needed */},
  }));

  const W = width;
  const H = height;

  // Box geometry
  const boxX = W * 0.1;
  const boxY = H * 0.18;
  const boxW = W * 0.8;
  const boxH = H * 0.72;
  const boxR = 10;

  // Slot geometry (coin slot at top-center)
  const slotW = boxW * 0.3;
  const slotH = 8;
  const slotX = boxX + (boxW - slotW) / 2;
  const slotY = boxY - slotH / 2;

  return (
    <View style={[styles.container, { width: W, height: H }]}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          {/* Main body gradient — dark Chabad blue */}
          <LinearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1a3a8a" stopOpacity="1" />
            <Stop offset="0.3" stopColor="#1e4db7" stopOpacity="1" />
            <Stop offset="0.7" stopColor="#1a3fa0" stopOpacity="1" />
            <Stop offset="1" stopColor="#0f2060" stopOpacity="1" />
          </LinearGradient>
          {/* Top cap gradient */}
          <LinearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2a5ad4" stopOpacity="1" />
            <Stop offset="1" stopColor="#1230a0" stopOpacity="1" />
          </LinearGradient>
          {/* Metallic sheen on left edge */}
          <LinearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4a7ae8" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#4a7ae8" stopOpacity="0" />
          </LinearGradient>
          {/* Bottom cap */}
          <LinearGradient id="bottomGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0f2060" stopOpacity="1" />
            <Stop offset="1" stopColor="#091540" stopOpacity="1" />
          </LinearGradient>
          {/* Slot shadow */}
          <LinearGradient id="slotGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000820" stopOpacity="1" />
            <Stop offset="1" stopColor="#001040" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* ── Shadow under box ── */}
        <Ellipse
          cx={W / 2}
          cy={boxY + boxH + 12}
          rx={boxW * 0.4}
          ry={8}
          fill="#000"
          opacity={0.35}
        />

        {/* ── Main body ── */}
        <Rect
          x={boxX}
          y={boxY}
          width={boxW}
          height={boxH}
          rx={boxR}
          ry={boxR}
          fill="url(#bodyGrad)"
        />

        {/* ── Left metallic sheen ── */}
        <Rect
          x={boxX}
          y={boxY}
          width={boxW * 0.35}
          height={boxH}
          rx={boxR}
          ry={boxR}
          fill="url(#sheenGrad)"
        />

        {/* ── Top cap ── */}
        <Rect
          x={boxX - 3}
          y={boxY - 10}
          width={boxW + 6}
          height={20}
          rx={5}
          fill="url(#capGrad)"
        />

        {/* ── Coin slot ── */}
        <Rect
          x={slotX}
          y={slotY}
          width={slotW}
          height={slotH}
          rx={slotH / 2}
          fill="url(#slotGrad)"
        />
        {/* Slot highlight edge */}
        <Rect
          x={slotX + 1}
          y={slotY + 1}
          width={slotW - 2}
          height={2}
          rx={1}
          fill="#4a7ae8"
          opacity={0.4}
        />

        {/* ── Chabad menorah (7 branches, simplified) ── */}
        <G transform={`translate(${W / 2}, ${boxY + boxH * 0.22})`}>
          {/* Base */}
          <Rect x={-18} y={22} width={36} height={4} rx={2} fill="#F59E0B" opacity={0.9} />
          {/* Center stem */}
          <Rect x={-2} y={-20} width={4} height={42} rx={2} fill="#F59E0B" opacity={0.9} />
          {/* Branch arms — pairs */}
          {[
            { x: -14, y: 4, h: 16 },
            { x: 10,  y: 4, h: 16 },
            { x: -22, y: 10, h: 10 },
            { x: 18,  y: 10, h: 10 },
          ].map((b, i) => (
            <G key={i}>
              <Rect x={b.x} y={b.y} width={4} height={b.h} rx={2} fill="#F59E0B" opacity={0.85} />
            </G>
          ))}
          {/* Horizontal connecting bar */}
          <Rect x={-24} y={3} width={48} height={4} rx={2} fill="#F59E0B" opacity={0.7} />
          {/* Flames on each branch top */}
          {[-24, -14, -6, 0, 6, 14, 24].map((x, i) => (
            <Ellipse key={i} cx={x + 2} cy={i === 3 ? -22 : (i < 3 ? 2 + (3 - i) * 2 : 2 + (i - 3) * 2)} rx={3} ry={4} fill="#F59E0B" opacity={0.9} />
          ))}
        </G>

        {/* ── Hebrew text: בית חב״ד ── */}
        <SvgText
          x={W / 2}
          y={boxY + boxH * 0.55}
          textAnchor="middle"
          fill="#F8FAFF"
          fontSize={15}
          fontWeight="bold"
          opacity={0.95}
        >
          בית חב״ד
        </SvgText>
        <SvgText
          x={W / 2}
          y={boxY + boxH * 0.55 + 20}
          textAnchor="middle"
          fill="#bdd0ff"
          fontSize={10}
          opacity={0.8}
        >
          קרית בורוכוב ותל גנים
        </SvgText>

        {/* ── Tzedaka text in small print ── */}
        <SvgText
          x={W / 2}
          y={boxY + boxH * 0.82}
          textAnchor="middle"
          fill="#7a9ae8"
          fontSize={11}
          opacity={0.7}
        >
          קופת צדקה
        </SvgText>

        {/* ── Bottom cap ── */}
        <Rect
          x={boxX + 6}
          y={boxY + boxH - 6}
          width={boxW - 12}
          height={14}
          rx={4}
          fill="url(#bottomGrad)"
        />

        {/* ── Lock clasp ── */}
        <Rect
          x={W / 2 - 10}
          y={boxY + boxH + 2}
          width={20}
          height={7}
          rx={3.5}
          fill="#0f2060"
          stroke="#2a50b0"
          strokeWidth={1}
        />
        <Circle
          cx={W / 2}
          cy={boxY + boxH + 5.5}
          r={2}
          fill="#4a7ae8"
          opacity={0.7}
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Pushke;
