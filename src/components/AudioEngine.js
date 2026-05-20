import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const SOURCES = [
  require('../../assets/coin.mp3'),
  require('../../assets/coin2.mp3'),
  require('../../assets/coin3.mp3'),
  require('../../assets/coin4.mp3'),
];

const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  const sounds  = useRef([]);
  const lastIdx = useRef(-1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS:         false,
          playsInSilentModeIOS:       true,
          staysActiveInBackground:    false,
          shouldDuckAndroid:          false,
          playThroughEarpieceAndroid: false,
        });
        const loaded = await Promise.all(
          SOURCES.map(src =>
            Audio.Sound.createAsync(src, { shouldPlay: false, volume: 1.0, isMuted: false })
          )
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
      if (sounds.current.length === 0) return;
      // Pick a different sound than last time (no busy flag — rapid drops each play)
      let idx;
      do { idx = Math.floor(Math.random() * sounds.current.length); }
      while (idx === lastIdx.current && sounds.current.length > 1);
      lastIdx.current = idx;
      const s = sounds.current[idx];
      try {
        await s.stopAsync().catch(() => {});
        await s.setPositionAsync(0);
        await s.setVolumeAsync(1.0);
        await s.playAsync();
      } catch (_) {}
    },
  }));

  return null;
});

export default AudioEngine;
