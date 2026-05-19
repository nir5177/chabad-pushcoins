import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

let WebView = null;
try {
  WebView = require('react-native-webview').WebView;
} catch (_) {}

/**
 * Invisible WebView that synthesises realistic coin-clank sounds
 * via the Web Audio API. Each shekel denomination gets a distinct
 * metallic timbre tuned to sound like a real coin hitting a tin box.
 *
 * Usage (via ref):
 *   audioRef.current.playCoin({ value: 1, freq: 900 })
 */

const AUDIO_PAGE = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body>
<script>
const ctx = new (window.AudioContext || window.webkitAudioContext)();

/* ── Coin sound engine ─────────────────────────────────────────── */
function playCoin(freq, value) {
  const now = ctx.currentTime;

  /* 1. Primary metallic ring — sine wave with pitch drop */
  const ring = ctx.createOscillator();
  const ringGain = ctx.createGain();
  ring.connect(ringGain);
  ringGain.connect(ctx.destination);

  ring.type = 'sine';
  ring.frequency.setValueAtTime(freq, now);
  ring.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.35);

  ringGain.gain.setValueAtTime(0.55, now);
  ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

  ring.start(now);
  ring.stop(now + 0.4);

  /* 2. Impact click — short noise burst through bandpass */
  const bufLen = Math.floor(ctx.sampleRate * 0.04);
  const noiseBuffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = noiseBuffer;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq * 2.2;
  bp.Q.value = 1.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.9, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  noiseNode.connect(bp);
  bp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseNode.start(now);
  noiseNode.stop(now + 0.06);

  /* 3. Upper partial — adds the "metallic tin box" resonance */
  const partial = ctx.createOscillator();
  const partialGain = ctx.createGain();
  partial.connect(partialGain);
  partialGain.connect(ctx.destination);

  partial.type = 'triangle';
  partial.frequency.setValueAtTime(freq * 3.7, now);
  partial.frequency.exponentialRampToValueAtTime(freq * 2.5, now + 0.12);

  partialGain.gain.setValueAtTime(0.28, now);
  partialGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  partial.start(now);
  partial.stop(now + 0.15);
}

window.document.addEventListener('message', onMsg);   // Android
window.addEventListener('message', onMsg);             // iOS

function onMsg(e) {
  try {
    const d = JSON.parse(e.data);
    if (d.type === 'playCoin') {
      /* resume context on first interaction (iOS autoplay policy) */
      if (ctx.state === 'suspended') ctx.resume();
      playCoin(d.freq, d.value);
    }
  } catch (_) {}
}
</script>
</body>
</html>
`;

const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  const webviewRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({
    playCoin({ freq, value }) {
      if (failed || !WebView) return;
      webviewRef.current?.postMessage(
        JSON.stringify({ type: 'playCoin', freq, value })
      );
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
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: -999,
    left: -999,
  },
  webview: {
    width: 1,
    height: 1,
    backgroundColor: 'transparent',
  },
});

export default AudioEngine;
