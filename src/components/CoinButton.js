import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import Svg, {
  Circle, Text as SvgText, Defs, LinearGradient, Stop, Ellipse,
} from 'react-native-svg';

/**
 * A pressable coin button drawn as an SVG shekel coin.
 *
 * Props:
 *  coin    — { value: number, label: string, size: 'sm'|'md'|'lg'|'xl' }
 *  onPress — callback(coin)
 */
export default function CoinButton({ coin, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  }

  const sz = SIZES[coin.size] || SIZES.md;
  const r = sz / 2;

  const isHalf = coin.value === 0.5;
  // Half-shekel is silver; others are gold
  const gradId = `coinGrad_${coin.value}`;
  const edgeId = `edgeGrad_${coin.value}`;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(coin)}
        accessibilityRole="button"
        accessibilityLabel={`הכנס מטבע ${coin.label}`}
        style={styles.pressable}
        hitSlop={8}
      >
        <Svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <Defs>
            <LinearGradient id={gradId} x1="0.2" y1="0" x2="0.8" y2="1">
              {isHalf ? (
                <>
                  <Stop offset="0" stopColor="#e8e8e8" />
                  <Stop offset="0.4" stopColor="#d0d0d0" />
                  <Stop offset="0.7" stopColor="#b8b8b8" />
                  <Stop offset="1" stopColor="#a0a0a0" />
                </>
              ) : (
                <>
                  <Stop offset="0" stopColor="#ffe27a" />
                  <Stop offset="0.35" stopColor="#f0b429" />
                  <Stop offset="0.7" stopColor="#c8860a" />
                  <Stop offset="1" stopColor="#a86000" />
                </>
              )}
            </LinearGradient>
            <LinearGradient id={edgeId} x1="0" y1="0" x2="0" y2="1">
              {isHalf ? (
                <>
                  <Stop offset="0" stopColor="#c0c0c0" />
                  <Stop offset="1" stopColor="#808080" />
                </>
              ) : (
                <>
                  <Stop offset="0" stopColor="#c89020" />
                  <Stop offset="1" stopColor="#7a4800" />
                </>
              )}
            </LinearGradient>
          </Defs>

          {/* Coin edge (3-D depth ring) */}
          <Circle cx={r} cy={r + 2} r={r - 1} fill={`url(#${edgeId})`} />

          {/* Coin face */}
          <Circle cx={r} cy={r} r={r - 2} fill={`url(#${gradId})`} />

          {/* Inner rim */}
          <Circle
            cx={r}
            cy={r}
            r={r - 5}
            fill="none"
            stroke={isHalf ? '#a0a0a0' : '#a87000'}
            strokeWidth={1.2}
            opacity={0.5}
          />

          {/* Denomination label */}
          <SvgText
            x={r}
            y={r + (sz < 60 ? 4 : 5)}
            textAnchor="middle"
            fill={isHalf ? '#404040' : '#3a1800'}
            fontSize={sz < 60 ? sz * 0.28 : sz * 0.3}
            fontWeight="bold"
          >
            {coin.label}
          </SvgText>

          {/* Small ₪ sign below (only for bigger coins) */}
          {sz >= 70 && (
            <SvgText
              x={r}
              y={r + sz * 0.3}
              textAnchor="middle"
              fill={isHalf ? '#606060' : '#5a2800'}
              fontSize={sz * 0.13}
              opacity={0.7}
            >
              שקל
            </SvgText>
          )}

          {/* Highlight glare */}
          <Ellipse
            cx={r - sz * 0.12}
            cy={r - sz * 0.18}
            rx={sz * 0.18}
            ry={sz * 0.1}
            fill="white"
            opacity={0.22}
            transform={`rotate(-30, ${r}, ${r})`}
          />
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

// Coin diameter per size key
const SIZES = {
  sm: 56,
  md: 68,
  lg: 80,
  xl: 92,
};

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
