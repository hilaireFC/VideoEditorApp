// src/components/CustomSlider.tsx
// Slider 100% JS - aucune dépendance native requise
import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet, Text } from 'react-native';

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (val: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  minimumTrackTintColor = '#7C3AED',
  maximumTrackTintColor = '#374151',
  thumbTintColor = '#7C3AED',
  style,
}) => {
  const trackWidth = useRef<number>(0);
  const trackX = useRef<number>(0);

  const clamp = (v: number) => Math.min(maximumValue, Math.max(minimumValue, v));
  const ratio = (value - minimumValue) / (maximumValue - minimumValue);
  const fillPercent = `${(ratio * 100).toFixed(1)}%`;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const w = trackWidth.current;
        if (w > 0) {
          const newRatio = Math.max(0, Math.min(1, x / w));
          const newVal = minimumValue + newRatio * (maximumValue - minimumValue);
          onValueChange(clamp(newVal));
        }
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.pageX - trackX.current;
        const w = trackWidth.current;
        if (w > 0) {
          const newRatio = Math.max(0, Math.min(1, x / w));
          const newVal = minimumValue + newRatio * (maximumValue - minimumValue);
          onValueChange(clamp(newVal));
        }
      },
    })
  ).current;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={styles.track}
        onLayout={(e) => {
          trackWidth.current = e.nativeEvent.layout.width;
          trackX.current = e.nativeEvent.layout.x;
        }}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View style={[styles.trackBg, { backgroundColor: maximumTrackTintColor }]} />
        {/* Fill track */}
        <View style={[styles.trackFill, { width: fillPercent as any, backgroundColor: minimumTrackTintColor }]} />
        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: fillPercent as any,
              backgroundColor: thumbTintColor,
              borderColor: thumbTintColor,
              transform: [{ translateX: -12 }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  track: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: '50%',
    marginTop: -12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
