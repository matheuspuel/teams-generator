import React from 'react'
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { IO } from 'src/utils/fp'

export const Slider = ({
  step,
  onChange,
}: {
  step: 0.05
  onChange: (percentage: number) => IO<void>
}) => {
  const paddingHorizontal = 40
  const paddingVertical = 40
  const trackWidth = 10
  const thumbSize = 30
  const trackColor = 'gray'
  const thumbColor = 'green'
  const [width, setWidth] = React.useState(0)
  const position = useSharedValue(0)

  const getPosition = (
    e: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ) => {
    'worklet'
    return Math.max(0, Math.min(e.x - paddingHorizontal, width))
  }

  const getResultPercentage = (
    e: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ) => {
    'worklet'
    const p = getPosition(e)
    const v = p / width
    return Math.round(v / step) * step
  }

  const gesture = Gesture.Pan()
    .onBegin(e => {
      const n = getResultPercentage(e)
      position.value = withTiming(n * width)
      runOnJS(onChange)(n)
    })
    .onUpdate(e => {
      position.value = getPosition(e)
    })
    .onEnd(e => {
      const n = getResultPercentage(e)
      position.value = withTiming(n * width)
      runOnJS(onChange)(n)
    })
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }))
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
        }}
      >
        <Animated.View
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
          style={{
            height: trackWidth,
            borderRadius: trackWidth / 2,
            backgroundColor: trackColor,
          }}
        >
          <Animated.View
            style={[
              {
                marginTop: (trackWidth - thumbSize) / 2,
                marginLeft: -thumbSize / 2,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: thumbColor,
              },
              animatedStyles,
            ]}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}
