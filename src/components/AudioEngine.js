import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

let WebView = null;
try { WebView = require('react-native-webview').WebView; } catch (_) {}

/*
 * Synthesises a realistic "coin dropping into a metal charity box" sound.
 * Each denomination gets a distinct pitch but the same metallic character:
 *   ½₪  — highest ping  (1380 Hz)
 *   ₪1  — high ping     (950 Hz)
 *   ₪2  — mid-high ping (750 Hz)
 *   ₪5  — mid ping      (620 Hz)
 *   ₪10 — deep clank    (420 Hz)
 */
const AUDIO_PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script>
let ctx;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playCoin(freq, value) {
  const c = getCtx();
  const now = c.currentTime;

  /* ── Impact transient: short noise burst ── */
  const bufLen = Math.floor(c.sampleRate * 0.025);
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const nfilt = c.createBiquadFilter();
  nfilt.type = 'bandpass';
  nfilt.frequency.value = freq * 1.8;
  nfilt.Q.value = 1.2;
  const ngain = c.createGain();
  ngain.gain.setValueAtTime(1.2, now);
  ngain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  noise.connect(nfilt); nfilt.connect(ngain); ngain.connect(c.destination);
  noise.start(now); noise.stop(now + 0.06);

  /* ── Primary ring: coin resonance ── */
  const ring = c.createOscillator();
  const rgain = c.createGain();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(freq, now);
  ring.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.45);
  rgain.gain.setValueAtTime(0.6, now);
  rgain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  ring.connect(rgain); rgain.connect(c.destination);
  ring.start(now); ring.stop(now + 0.5);

  /* ── Box resonance: low thud of metal box ── */
  const box = c.createOscillator();
  const bgain = c.createGain();
  box.type = 'triangle';
  box.frequency.setValueAtTime(freq * 0.28, now);
  box.frequency.exponentialRampToValueAtTime(freq * 0.18, now + 0.18);
  bgain.gain.setValueAtTime(0.35, now);
  bgain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  box.connect(bgain); bgain.connect(c.destination);
  box.start(now); box.stop(now + 0.22);

  /* ── Overtone shimmer ── */
  const ov = c.createOscillator();
  const ogain = c.createGain();
  ov.type = 'sine';
  ov.frequency.setValueAtTime(freq * 2.76, now);
  ov.frequency.exponentialRampToValueAtTime(freq * 2.0, now + 0.12);
  ogain.gain.setValueAtTime(0.18, now);
  ogain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  ov.connect(ogain); ogain.connect(c.destination);
  ov.start(now); ov.stop(now + 0.16);
}

function onMsg(e) {
  try {
    const d = JSON.parse(e.data);
    if (d.type === 'playCoin') playCoin(d.freq, d.value);
    if (d.type === 'ping') { window.ReactNativeWebView.postMessage('pong'); }
  } catch(_) {}
}
document.addEventListener('message', onMsg);
window.addEventListener('message', onMsg);
<\/script></body></html>`;

const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  const webviewRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({
    playCoin({ freq, value }) {
      if (failed || !WebView) return;
      try {
        webviewRef.current?.postMessage(JSON.stringify({ type: 'playCoin', freq, value }));
      } catch (_) {}
    },
  }));

  if (!WebView || failed) return null;

  return (
    <View style={styles.hidden} pointerEvents="none">
      <WebView
        ref={webviewRef}
        source={{ html: AUDIO_PAGE }}
        style={styles.webview}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        androidLayerType="hardware"
        onMessage={() => {}}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute', width: 1, height: 1,
    opacity: 0, top: -999, left: -999,
  },
  webview: { width: 1, height: 1, backgroundColor: 'transparent' },
});

export default AudioEngine;
