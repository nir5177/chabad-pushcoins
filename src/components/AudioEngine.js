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
  const busy    = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS:        false,
          playsInSilentModeIOS:      true,
          staysActiveInBackground:   false,
          shouldDuckAndroid:         false,
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
      if (busy.current || sounds.current.length === 0) return;
      busy.current = true;
      try {
        // Pick a different sound than last time
        let idx;
        do { idx = Math.floor(Math.random() * sounds.current.length); }
        while (idx === lastIdx.current && sounds.current.length > 1);
        lastIdx.current = idx;

        const s = sounds.current[idx];
        // stop → rewind → play is the most reliable cross-platform sequence
        await s.stopAsync().catch(() => {});
        await s.setPositionAsync(0);
        await s.setVolumeAsync(1.0);
        await s.playAsync();
      } catch (_) {}
      finally { busy.current = false; }
    },
  }));

  return null;
});

export default AudioEngine;
