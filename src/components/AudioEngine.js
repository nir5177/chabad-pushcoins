import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// All 4 uploaded coin sounds
const SOURCES = [
  require('../../assets/coin.mp3'),
  require('../../assets/coin2.mp3'),
  require('../../assets/coin3.mp3'),
  require('../../assets/coin4.mp3'),
];

const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  const sounds = useRef([]);
  const lastIdx = useRef(-1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
        const loaded = await Promise.all(
          SOURCES.map(src => Audio.Sound.createAsync(src, { shouldPlay: false, volume: 1.0 }))
        );
        if (mounted) sounds.current = loaded.map(r => r.sound);
      } catch (_) {}
    })();
    return () => {
      mounted = false;
      sounds.current.forEach(s => s.unloadAsync().catch(() => {}));
    };
  }, []);

  useImperativeHandle(ref, () => ({
    async playCoin() {
      try {
        if (sounds.current.length === 0) return;
        // Pick a different sound each time (cycle through all 4)
        let idx;
        do { idx = Math.floor(Math.random() * sounds.current.length); }
        while (idx === lastIdx.current && sounds.current.length > 1);
        lastIdx.current = idx;
        await sounds.current[idx].replayAsync();
      } catch (_) {}
    },
  }));

  return null;
});

export default AudioEngine;
