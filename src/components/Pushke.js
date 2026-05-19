import React from 'react';
import { View } from 'react-native';
import Svg, {
  Rect, Polygon, Ellipse, Circle, G,
  Text as SvgText, Defs, LinearGradient, Stop,
} from 'react-native-svg';

/**
 * Classic 3D tin charity box (פושקה) viewed from slightly above,
 * with a glowing coin slot on the top face.
 * Chabad navy + gold colour scheme.
 */
export default function Pushke({ width = 300, height = 210 }) {
  const W = width;
  const H = height;

  // Front face geometry
  const fL = W * 0.05,   fR = W * 0.95;
  const fT = H * 0.32,   fB = H * 0.93;
  const fW = fR - fL,    fH = fB - fT;

  // Top face (trapezoid — perspective above)
  const tL = W * 0.09,   tR = W * 0.91;
  const tT = H * 0.08;
  // Top face corners: front-left (fL,fT), front-right (fR,fT), back-right (tR,tT), back-left (tL,tT)
  const topPts = `${fL},${fT} ${fR},${fT} ${tR},${tT} ${tL},${tT}`;

  // Slot on top face (centered, about 45% of top face width)
  const slotMidY = (fT + tT) / 2;
  const topMidLeft  = fL + (tL - fL) * 0.5 + fW * 0.28;
  const topMidRight = fL + (tL - fL) * 0.5 + fW * 0.72;
  const slotH = H * 0.034;
  const slotPts = `${topMidLeft},${slotMidY - slotH / 2} ${topMidRight},${slotMidY - slotH / 2} ${topMidRight + (tR - fR) * 0.12},${slotMidY + slotH / 2} ${topMidLeft + (tL - fL) * 0.12},${slotMidY + slotH / 2}`;

  // Logo circle centre on front face
  const logoX = W / 2, logoY = fT + fH * 0.38, logoR = fW * 0.15;

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>

          {/* Front face — deep navy with subtle vertical gradient */}
          <LinearGradient id="pkFront" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#1e2a8a" />
            <Stop offset="0.4" stopColor="#16206e" />
            <Stop offset="1"   stopColor="#0b1248" />
          </LinearGradient>

          {/* Top face — slightly lighter (catches light) */}
          <LinearGradient id="pkTop" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0"   stopColor="#2a3ab0" />
            <Stop offset="1"   stopColor="#3848c8" />
          </LinearGradient>

          {/* Left-side sheen on front face */}
          <LinearGradient id="pkSheen" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor="#5060e0" stopOpacity="0.35" />
            <Stop offset="0.5" stopColor="#5060e0" stopOpacity="0" />
          </LinearGradient>

          {/* Logo circle gradient */}
          <LinearGradient id="logoGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#1a2880" />
            <Stop offset="1"   stopColor="#0a1050" />
          </LinearGradient>

          {/* Bottom shadow gradient */}
          <LinearGradient id="pkBottom" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#0a1248" />
            <Stop offset="1"   stopColor="#060a30" />
          </LinearGradient>
        </Defs>

        {/* ── Ground shadow ── */}
        <Ellipse cx={W / 2} cy={H * 0.98} rx={fW * 0.44} ry={H * 0.022}
          fill="#000" opacity={0.28} />

        {/* ── Top face ── */}
        <Polygon points={topPts} fill="url(#pkTop)" />

        {/* Top face edge highlight */}
        <Polygon
          points={`${tL},${tT} ${tR},${tT} ${tR + 1},${tT + 2} ${tL - 1},${tT + 2}`}
          fill="#5a6ae8" opacity={0.6}
        />

        {/* ── Glowing coin slot ── */}
        {/* Outer glow (simple larger white polygon) */}
        <Polygon points={slotPts} fill="white" opacity={0.35} />
        {/* Slot itself */}
        <Polygon points={slotPts} fill="white" opacity={0.95} />
        {/* Inner dark slit */}
        <Polygon
          points={`${topMidLeft + 4},${slotMidY - slotH / 2 + 2} ${topMidRight - 4},${slotMidY - slotH / 2 + 2} ${topMidRight + (tR - fR) * 0.12 - 4},${slotMidY + slotH / 2 - 2} ${topMidLeft + (tL - fL) * 0.12 + 4},${slotMidY + slotH / 2 - 2}`}
          fill="#050a30"
          opacity={0.7}
        />

        {/* ── Front face ── */}
        <Rect x={fL} y={fT} width={fW} height={fH} rx={6} fill="url(#pkFront)" />

        {/* Left sheen */}
        <Rect x={fL} y={fT} width={fW * 0.4} height={fH} rx={6} fill="url(#pkSheen)" />

        {/* Top edge of front face (chrome strip) */}
        <Rect x={fL} y={fT} width={fW} height={4} rx={2} fill="#3848d0" opacity={0.7} />

        {/* ── Bottom cap ── */}
        <Rect x={fL + 8} y={fB - 10} width={fW - 16} height={14} rx={4} fill="url(#pkBottom)" />

        {/* ── Chabad logo circle ── */}
        <Circle cx={logoX} cy={logoY} r={logoR + 3}
          fill="#0a1248" stroke="#2a3ab0" strokeWidth={1.5} />
        <Circle cx={logoX} cy={logoY} r={logoR}
          fill="url(#logoGrad)" stroke="#3848c8" strokeWidth={1} />

        {/* Chabad 7-branch menorah inside circle */}
        <G transform={`translate(${logoX},${logoY})`}>
          {/* Base */}
          <Rect x={-logoR * 0.55} y={logoR * 0.5} width={logoR * 1.1} height={logoR * 0.14} rx={2} fill="#F59E0B" />
          {/* Center stem */}
          <Rect x={-logoR * 0.06} y={-logoR * 0.7} width={logoR * 0.12} height={logoR * 1.2} rx={2} fill="#F59E0B" />
          {/* Horizontal bar */}
          <Rect x={-logoR * 0.72} y={logoR * 0.05} width={logoR * 1.44} height={logoR * 0.1} rx={2} fill="#F59E0B" opacity={0.85} />
          {/* Branches */}
          {[
            [-logoR * 0.42, logoR * 0.05, logoR * 0.42],
            [ logoR * 0.30, logoR * 0.05, logoR * 0.42],
            [-logoR * 0.66, logoR * 0.15, logoR * 0.32],
            [ logoR * 0.54, logoR * 0.15, logoR * 0.32],
          ].map(([x, y, h], i) => (
            <Rect key={i} x={x} y={y} width={logoR * 0.11} height={h} rx={2} fill="#F59E0B" opacity={0.9} />
          ))}
          {/* Flames (small ellipses at top of each branch) */}
          {[
            [0, -logoR * 0.75],
            [-logoR * 0.38, logoR * 0.02],
            [ logoR * 0.35, logoR * 0.02],
            [-logoR * 0.62, logoR * 0.12],
            [ logoR * 0.59, logoR * 0.12],
          ].map(([x, y], i) => (
            <Ellipse key={i} cx={x} cy={y} rx={logoR * 0.08} ry={logoR * 0.12}
              fill="#FCD34D" opacity={0.95} />
          ))}
        </G>

        {/* ── Chabad text on front face ── */}
        <SvgText
          x={W / 2} y={fT + fH * 0.72}
          textAnchor="middle" fill="#F0F4FF"
          fontSize={fW * 0.07} fontWeight="bold" fontFamily="Arial"
        >
          בית חב״ד
        </SvgText>
        <SvgText
          x={W / 2} y={fT + fH * 0.86}
          textAnchor="middle" fill="#8090c8"
          fontSize={fW * 0.045} fontFamily="Arial"
        >
          קרית בורוכוב ותל גנים
        </SvgText>

        {/* ── Lock clasp at bottom ── */}
        <Rect
          x={W / 2 - fW * 0.065} y={fB + 2}
          width={fW * 0.13} height={fH * 0.055} rx={4}
          fill="#0a1248" stroke="#2030a0" strokeWidth={1}
        />
        <Circle cx={W / 2} cy={fB + 6} r={3} fill="#3040b8" opacity={0.8} />
      </Svg>
    </View>
  );
}
