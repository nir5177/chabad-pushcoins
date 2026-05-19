import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// Preloaded sounds: light (½₪,₪1), medium (₪2), heavy (₪5,₪10)
const SOURCES = {
  light:  require('../../assets/coin2.mp3'),
  medium: require('../../assets/coin.mp3'),
  heavy:  require('../../assets/coin3.mp3'),
};

function keyFor(value) {
  if (value <= 1) return 'light';
  if (value <= 2) return 'medium';
  return 'heavy';
}

const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  const sounds = useRef({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        for (const [key, src] of Object.entries(SOURCES)) {
          const { sound } = await Audio.Sound.createAsync(src, {
            shouldPlay: false,
            volume: 1.0,
          });
          if (mounted) sounds.current[key] = sound;
        }
      } catch (_) {}
    })();
    return () => {
      mounted = false;
      Object.values(sounds.current).forEach(s => s.unloadAsync().catch(() => {}));
    };
  }, []);

  useImperativeHandle(ref, () => ({
    async playCoin({ value }) {
      try {
        const sound = sounds.current[keyFor(value)];
        if (!sound) return;
        await sound.replayAsync();
      } catch (_) {}
    },
  }));

  return null;
});

export default AudioEngine;
