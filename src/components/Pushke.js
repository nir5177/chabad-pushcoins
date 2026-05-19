import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, {
  Rect, Polygon, Ellipse, G,
  Text as SvgText, Defs, LinearGradient, Stop,
  ClipPath, Circle,
} from 'react-native-svg';

// Rebbe portrait — bundled asset
let REBBE_IMG = null;
try { REBBE_IMG = require('../../assets/rebbe.jpg'); } catch (_) {}

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
  const topPts = `${fL},${fT} ${fR},${fT} ${tR},${tT} ${tL},${tT}`;

  // Coin slot
  const slotMidY = (fT + tT) / 2;
  const topMidLeft  = fL + (tL - fL) * 0.5 + fW * 0.28;
  const topMidRight = fL + (tL - fL) * 0.5 + fW * 0.72;
  const slotH = H * 0.034;
  const slotPts = `${topMidLeft},${slotMidY - slotH / 2} ${topMidRight},${slotMidY - slotH / 2} ${topMidRight + (tR - fR) * 0.12},${slotMidY + slotH / 2} ${topMidLeft + (tL - fL) * 0.12},${slotMidY + slotH / 2}`;

  // Portrait frame on front face (upper 55% of front)
  const frameMargin = fW * 0.12;
  const frameX = fL + frameMargin;
  const frameY = fT + fH * 0.06;
  const frameW = fW - frameMargin * 2;
  const frameH = fH * 0.55;
  const frameR = 8; // corner radius

  // Image sits inside a slightly smaller inset
  const inset = 4;
  const imgX = frameX + inset;
  const imgY = frameY + inset;
  const imgW = frameW - inset * 2;
  const imgH = frameH - inset * 2;

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="pkFront" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#1e2a8a" />
            <Stop offset="0.4" stopColor="#16206e" />
            <Stop offset="1"   stopColor="#0b1248" />
          </LinearGradient>
          <LinearGradient id="pkTop" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0"   stopColor="#2a3ab0" />
            <Stop offset="1"   stopColor="#3848c8" />
          </LinearGradient>
          <LinearGradient id="pkSheen" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor="#5060e0" stopOpacity="0.35" />
            <Stop offset="0.5" stopColor="#5060e0" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="pkBottom" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#0a1248" />
            <Stop offset="1"   stopColor="#060a30" />
          </LinearGradient>
          {/* Gold frame gradient */}
          <LinearGradient id="goldFrame" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0"   stopColor="#ffe87a" />
            <Stop offset="0.4" stopColor="#F59E0B" />
            <Stop offset="1"   stopColor="#a06010" />
          </LinearGradient>
          {/* Inner shadow around photo (recessed effect) */}
          <LinearGradient id="photoShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#000" stopOpacity="0.45" />
            <Stop offset="0.15" stopColor="#000" stopOpacity="0" />
            <Stop offset="0.85" stopColor="#000" stopOpacity="0" />
            <Stop offset="1"   stopColor="#000" stopOpacity="0.35" />
          </LinearGradient>
          {/* Photo glare */}
          <LinearGradient id="photoGlare" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor="#fff" stopOpacity="0.18" />
            <Stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
          {/* ClipPath for photo */}
          <ClipPath id="photoClip">
            <Rect x={imgX} y={imgY} width={imgW} height={imgH} rx={frameR - inset} />
          </ClipPath>
        </Defs>

        {/* Ground shadow */}
        <Ellipse cx={W / 2} cy={H * 0.98} rx={fW * 0.44} ry={H * 0.022}
          fill="#000" opacity={0.28} />

        {/* Top face */}
        <Polygon points={topPts} fill="url(#pkTop)" />
        <Polygon
          points={`${tL},${tT} ${tR},${tT} ${tR + 1},${tT + 2} ${tL - 1},${tT + 2}`}
          fill="#5a6ae8" opacity={0.6}
        />

        {/* Coin slot */}
        <Polygon points={slotPts} fill="white" opacity={0.35} />
        <Polygon points={slotPts} fill="white" opacity={0.95} />
        <Polygon
          points={`${topMidLeft + 4},${slotMidY - slotH / 2 + 2} ${topMidRight - 4},${slotMidY - slotH / 2 + 2} ${topMidRight + (tR - fR) * 0.12 - 4},${slotMidY + slotH / 2 - 2} ${topMidLeft + (tL - fL) * 0.12 + 4},${slotMidY + slotH / 2 - 2}`}
          fill="#050a30" opacity={0.7}
        />

        {/* Front face */}
        <Rect x={fL} y={fT} width={fW} height={fH} rx={6} fill="url(#pkFront)" />
        <Rect x={fL} y={fT} width={fW * 0.4} height={fH} rx={6} fill="url(#pkSheen)" />
        <Rect x={fL} y={fT} width={fW} height={4} rx={2} fill="#3848d0" opacity={0.7} />

        {/* Bottom cap */}
        <Rect x={fL + 8} y={fB - 10} width={fW - 16} height={14} rx={4} fill="url(#pkBottom)" />

        {/* ── Portrait frame — outer gold rim ── */}
        {/* Outer shadow (depth effect) */}
        <Rect
          x={frameX - 2} y={frameY + 3}
          width={frameW + 4} height={frameH + 4}
          rx={frameR + 2}
          fill="#000" opacity={0.4}
        />
        {/* Gold border */}
        <Rect
          x={frameX} y={frameY}
          width={frameW} height={frameH}
          rx={frameR}
          fill="url(#goldFrame)"
        />
        {/* Inner bevel (dark inset) */}
        <Rect
          x={frameX + 2} y={frameY + 2}
          width={frameW - 4} height={frameH - 4}
          rx={frameR - 1}
          fill="#0a0820"
        />
      </Svg>

      {/* ── Rebbe photo (React Native Image — positioned over SVG) ── */}
      {REBBE_IMG ? (
        <Image
          source={REBBE_IMG}
          style={[
            StyleSheet.absoluteFill,
            {
              left: imgX,
              top: imgY,
              width: imgW,
              height: imgH,
              borderRadius: frameR - inset,
              position: 'absolute',
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        /* Fallback placeholder when rebbe.jpg not yet bundled */
        <View style={{
          position: 'absolute',
          left: imgX, top: imgY,
          width: imgW, height: imgH,
          borderRadius: frameR - inset,
          backgroundColor: '#0d1555',
          alignItems: 'center', justifyContent: 'center',
        }} />
      )}

      {/* ── SVG overlays on top of the photo ── */}
      <Svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="photoShadow2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"    stopColor="#000" stopOpacity="0.5" />
            <Stop offset="0.2"  stopColor="#000" stopOpacity="0" />
            <Stop offset="0.8"  stopColor="#000" stopOpacity="0" />
            <Stop offset="1"    stopColor="#000" stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="glareH" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"    stopColor="#fff" stopOpacity="0.2" />
            <Stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
          <ClipPath id="photoClip2">
            <Rect x={imgX} y={imgY} width={imgW} height={imgH} rx={frameR - inset} />
          </ClipPath>
        </Defs>

        {/* Recessed shadow overlay on photo */}
        <Rect
          x={imgX} y={imgY} width={imgW} height={imgH}
          rx={frameR - inset}
          fill="url(#photoShadow2)"
          clipPath="url(#photoClip2)"
        />
        {/* Glare on photo */}
        <Rect
          x={imgX} y={imgY} width={imgW * 0.5} height={imgH}
          rx={frameR - inset}
          fill="url(#glareH)"
          clipPath="url(#photoClip2)"
        />

        {/* ── Text labels ── */}
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

        {/* Lock clasp */}
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
