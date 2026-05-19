import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, {
  Rect, Polygon, Ellipse, Circle, G,
  Text as SvgText, Defs, LinearGradient, RadialGradient, Stop, ClipPath, Line,
} from 'react-native-svg';

const REBBE_IMG = require('../../assets/rebbe.jpg');

export default function Pushke({ width = 300, height = 210, slotActive = false }) {
  const W = width;
  const H = height;

  // ── GEOMETRY ──────────────────────────────────────────────────────────────
  // Front face (main visible surface)
  const fL = W * 0.04;
  const fR = W * 0.82;
  const fT = H * 0.26;
  const fB = H * 0.95;
  const fW = fR - fL;
  const fH = fB - fT;

  // Right side face (depth)
  const rR = W * 0.97;
  const rT = H * 0.09;

  // Top face corners
  const topPts = [
    { x: fL,  y: fT },          // front-bottom-left
    { x: fR,  y: fT },          // front-bottom-right
    { x: rR,  y: rT },          // back-top-right
    { x: fL + (rR - fR) * 0.09, y: rT }, // back-top-left (perspective)
  ];

  const topStr = topPts.map(p => `${p.x},${p.y}`).join(' ');
  const rightStr = `${fR},${fT} ${rR},${rT} ${rR},${fB} ${fR},${fB}`;

  // Coin slot (centered on top face, slightly toward front)
  const slotCX = fL + (fR - fL) * 0.50;
  const slotCY = fT - (fT - rT) * 0.45;  // 45% up the top face
  const slotW  = fW * 0.42;
  const slotHh = H * 0.022;

  // Portrait frame on front face
  const fmX = fL + fW * 0.07;
  const fmY = fT + fH * 0.04;
  const fmW = fW * 0.86;
  const fmH = fH * 0.53;
  const fmR = 10;
  const ins = 6;
  const imgX = fmX + ins;
  const imgY = fmY + ins;
  const imgW = fmW - ins * 2;
  const imgH = fmH - ins * 2;

  return (
    <View style={{ width: W, height: H }}>

      {/* ── LAYER 1: Box structure ──────────────────────────────────────── */}
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
        <Defs>

          {/* Front face base: top-left bright → bottom-right dark */}
          <LinearGradient id="pkFrontBase" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#2C44C8" />
            <Stop offset="18%"  stopColor="#1E34B0" />
            <Stop offset="65%"  stopColor="#142890" />
            <Stop offset="100%" stopColor="#0A1660" />
          </LinearGradient>

          {/* Front: left-to-right darkening (right side gets less light) */}
          <LinearGradient id="pkFrontLR" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.10" />
            <Stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </LinearGradient>

          {/* Primary specular: bright diagonal band (painted metal highlight) */}
          <LinearGradient id="pkSpecular" x1="0" y1="0" x2="0.45" y2="1">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.22" />
            <Stop offset="35%"  stopColor="#FFFFFF" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>

          {/* Ambient occlusion: bottom-left corner shadow */}
          <LinearGradient id="pkAOBottom" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="60%"  stopColor="#000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000" stopOpacity="0.28" />
          </LinearGradient>
          <LinearGradient id="pkAOLeft" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#000" stopOpacity="0.20" />
            <Stop offset="14%"  stopColor="#000" stopOpacity="0" />
          </LinearGradient>

          {/* Right side face: deep shadow */}
          <LinearGradient id="pkRight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#0C1878" />
            <Stop offset="35%"  stopColor="#081260" />
            <Stop offset="100%" stopColor="#040A40" />
          </LinearGradient>
          {/* Right side top-to-bottom darkening */}
          <LinearGradient id="pkRightTB" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.20" />
          </LinearGradient>

          {/* Top face: lit from above */}
          <LinearGradient id="pkTop" x1="0.3" y1="1" x2="0.7" y2="0">
            <Stop offset="0%"   stopColor="#2438B8" />
            <Stop offset="50%"  stopColor="#3850D8" />
            <Stop offset="100%" stopColor="#4A62EC" />
          </LinearGradient>
          {/* Top face ambient occlusion near front edge */}
          <LinearGradient id="pkTopAO" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%"   stopColor="#000" stopOpacity="0.18" />
            <Stop offset="35%"  stopColor="#000" stopOpacity="0" />
          </LinearGradient>

          {/* Gold frame */}
          <LinearGradient id="pkGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor="#FFE87A" />
            <Stop offset="15%"  stopColor="#F5C832" />
            <Stop offset="42%"  stopColor="#C88515" />
            <Stop offset="70%"  stopColor="#F0C030" />
            <Stop offset="100%" stopColor="#7A4408" />
          </LinearGradient>
          {/* Gold top edge highlight */}
          <LinearGradient id="pkGoldTop" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>

          {/* Slot glow */}
          <LinearGradient id="pkSlotGlow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#FFE066" stopOpacity="0.85" />
          </LinearGradient>

        </Defs>

        {/* ── Ground cast shadow ── */}
        <Ellipse
          cx={W * 0.50} cy={H * 0.985}
          rx={fW * 0.55} ry={H * 0.018}
          fill="#000" opacity={0.22}
        />

        {/* ── RIGHT SIDE FACE ── */}
        <Polygon points={rightStr} fill="url(#pkRight)" />
        <Polygon points={rightStr} fill="url(#pkRightTB)" />
        {/* Edge separating front from right (dark crease) */}
        <Line x1={fR} y1={fT} x2={fR} y2={fB} stroke="#060C3C" strokeWidth={2} />
        {/* Bright bevel highlight on the front-right edge */}
        <Line x1={fR} y1={fT} x2={fR} y2={fB} stroke="#5060D8" strokeWidth={1} opacity={0.55} />

        {/* ── TOP FACE ── */}
        <Polygon points={topStr} fill="url(#pkTop)" />
        <Polygon points={topStr} fill="url(#pkTopAO)" />
        {/* Bright edge where top meets front */}
        <Line x1={fL} y1={fT} x2={fR} y2={fT} stroke="#6878F0" strokeWidth={2} opacity={0.6} />
        {/* Bright edge at the very top of the box */}
        <Line
          x1={topPts[3].x} y1={topPts[3].y}
          x2={topPts[2].x} y2={topPts[2].y}
          stroke="#8898FF" strokeWidth={1} opacity={0.35}
        />

        {/* ── COIN SLOT ── */}
        {/* Glow ring when active */}
        {slotActive && (
          <Ellipse
            cx={slotCX} cy={slotCY}
            rx={slotW * 0.75} ry={slotHh * 3.2}
            fill="#FFD700" opacity={0.5}
          />
        )}
        {/* Slot white surface (lit from above) */}
        <Rect
          x={slotCX - slotW / 2} y={slotCY - slotHh}
          width={slotW} height={slotHh * 2} rx={slotHh}
          fill={slotActive ? "#FFF" : "#E8EAFF"} opacity={0.94}
        />
        {/* Slot dark interior (the opening into the box) */}
        <Rect
          x={slotCX - slotW / 2 + 4} y={slotCY - slotHh * 0.55}
          width={slotW - 8} height={slotHh * 1.1} rx={slotHh * 0.5}
          fill="#010510" opacity={0.92}
        />

        {/* ── FRONT FACE ── */}
        <Rect x={fL} y={fT} width={fW} height={fH} rx={4} fill="url(#pkFrontBase)" />
        <Rect x={fL} y={fT} width={fW} height={fH} rx={4} fill="url(#pkFrontLR)" />
        <Rect x={fL} y={fT} width={fW * 0.58} height={fH} rx={4} fill="url(#pkSpecular)" />
        <Rect x={fL} y={fT} width={fW} height={fH} rx={4} fill="url(#pkAOBottom)" />
        <Rect x={fL} y={fT} width={fW} height={fH} rx={4} fill="url(#pkAOLeft)" />

        {/* Subtle horizontal reflection band (looks like a fluorescent lamp reflected) */}
        <Rect
          x={fL + fW * 0.08} y={fT + fH * 0.14}
          width={fW * 0.84} height={fH * 0.018}
          rx={2} fill="#FFFFFF" opacity={0.055}
        />

        {/* Top chrome lip of front face */}
        <Rect x={fL} y={fT} width={fW} height={3} rx={2} fill="#5868F0" opacity={0.75} />

        {/* Bottom base cap */}
        <Rect x={fL} y={fB - 12} width={fW} height={16} rx={3} fill="#080E4C" />
        <Rect x={fL} y={fB - 12} width={fW} height={3} rx={2} fill="#101A70" />

        {/* ── GOLD PORTRAIT FRAME ── */}
        {/* Drop shadow under frame */}
        <Rect x={fmX + 5} y={fmY + 7} width={fmW} height={fmH} rx={fmR + 2} fill="#000" opacity={0.45} />
        {/* Gold border */}
        <Rect x={fmX} y={fmY} width={fmW} height={fmH} rx={fmR} fill="url(#pkGold)" />
        {/* Gold top-left highlight (makes frame look 3D beveled) */}
        <Rect x={fmX + 2} y={fmY + 2} width={fmW * 0.5} height={3} rx={1} fill="url(#pkGoldTop)" opacity={0.6} />
        <Rect x={fmX + 2} y={fmY + 2} width={3} height={fmH * 0.5} rx={1} fill="#FFFFFF" opacity={0.20} />
        {/* Inner dark mat */}
        <Rect x={imgX} y={imgY} width={imgW} height={imgH} rx={fmR - ins + 2} fill="#060318" />
      </Svg>

      {/* ── LAYER 2: Rebbe photo ───────────────────────────────────────────── */}
      <Image
        source={REBBE_IMG}
        style={{
          position: 'absolute',
          left: imgX,
          top: imgY,
          width: imgW,
          height: imgH,
          borderRadius: fmR - ins + 2,
        }}
        resizeMode="cover"
      />

      {/* ── LAYER 3: Overlays + text ──────────────────────────────────────── */}
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <ClipPath id="pc">
            <Rect x={imgX} y={imgY} width={imgW} height={imgH} rx={fmR - ins + 2} />
          </ClipPath>
          {/* Vignette top */}
          <LinearGradient id="vTop" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#000" stopOpacity="0.42" />
            <Stop offset="28%"  stopColor="#000" stopOpacity="0" />
          </LinearGradient>
          {/* Vignette bottom */}
          <LinearGradient id="vBot" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="68%"  stopColor="#000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000" stopOpacity="0.38" />
          </LinearGradient>
          {/* Glare on photo (simulates glass over portrait) */}
          <LinearGradient id="glare" x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.16" />
            <Stop offset="35%"  stopColor="#FFFFFF" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Photo overlays clipped to portrait area */}
        <Rect x={imgX} y={imgY} width={imgW} height={imgH} rx={fmR - ins + 2}
          fill="url(#vTop)" clipPath="url(#pc)" />
        <Rect x={imgX} y={imgY} width={imgW} height={imgH} rx={fmR - ins + 2}
          fill="url(#vBot)" clipPath="url(#pc)" />
        <Rect x={imgX} y={imgY} width={imgW * 0.6} height={imgH} rx={fmR - ins + 2}
          fill="url(#glare)" clipPath="url(#pc)" />

        {/* Frame bevel highlight (top-left lit corner of gold frame) */}
        <Rect x={fmX + ins - 1} y={fmY + ins - 1} width={imgW + 2} height={1.5} rx={1} fill="#FFFFFF" opacity={0.22} />
        <Rect x={fmX + ins - 1} y={fmY + ins - 1} width={1.5} height={imgH * 0.5} rx={1} fill="#FFFFFF" opacity={0.12} />

        {/* Hebrew text */}
        <SvgText
          x={fL + fW / 2} y={fT + fH * 0.72}
          textAnchor="middle" fill="#F0F4FF"
          fontSize={fW * 0.072} fontWeight="bold" fontFamily="Arial">
          בית חב״ד
        </SvgText>
        <SvgText
          x={fL + fW / 2} y={fT + fH * 0.84}
          textAnchor="middle" fill="#8898CC"
          fontSize={fW * 0.042} fontFamily="Arial">
          קרית בורוכוב ותל גנים
        </SvgText>

        {/* Lock clasp */}
        <Rect
          x={fL + fW / 2 - fW * 0.075} y={fB + 0}
          width={fW * 0.15} height={fH * 0.055}
          rx={4} fill="#0A1248" stroke="#1E2E98" strokeWidth={1.5}
        />
        {/* Keyhole circle */}
        <Circle cx={fL + fW / 2} cy={fB + 7} r={4} fill="#2838A8" />
        <Circle cx={fL + fW / 2} cy={fB + 6} r={2} fill="#050A30" />
        <Rect x={fL + fW / 2 - 1.2} y={fB + 7} width={2.4} height={3.5} rx={0.5} fill="#050A30" />
      </Svg>

    </View>
  );
}
