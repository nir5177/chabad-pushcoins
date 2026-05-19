import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Audio } from 'expo-av';

/*
 * 3 real coin-drop recordings, pitch-shifted per denomination:
 *
 *  coin.mp3  (36KB) — metallic clank, used for ½₪ and ₪1
 *  coin2.mp3 (7KB)  — light drop,    used for ₪2
 *  coin3.mp3 (45KB) — deep clank,    used for ₪5 and ₪10
 *
 * Playback rate shifts pitch: >1 = higher, <1 = lower.
 */
const SOUNDS = {
  0.5: { src: require('../../assets/coin2.mp3'), rate: 1.0 },
  1:   { src: require('../../assets/coin2.mp3'), rate: 1.0 },
  2:   { src: require('../../assets/coin.mp3'),  rate: 1.0 },
  5:   { src: require('../../assets/coin.mp3'),  rate: 1.0 },
  10:  { src: require('../../assets/coin3.mp3'), rate: 1.0 },
};

async function initAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (_) {}
}

async function playSound(value) {
  try {
    const cfg = SOUNDS[value] ?? SOUNDS[1];
    const { sound } = await Audio.Sound.createAsync(cfg.src, {
      shouldPlay: true,
      rate: cfg.rate,
      shouldCorrectPitch: false,
      volume: 1.0,
    });
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (_) {}
}

const AudioEngine = forwardRef(function AudioEngine(_props, ref) {
  useEffect(() => { initAudio(); }, []);

  useImperativeHandle(ref, () => ({
    playCoin({ value }) { playSound(value); },
  }));

  return null;
});

export default AudioEngine;
