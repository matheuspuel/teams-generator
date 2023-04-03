/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */
import { IO } from 'fp'
import React from 'react'
import { LayoutRectangle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const emptyLayout: LayoutRectangle = { height: 0, width: 0, x: 0, y: 0 }

export const Pressable = ({
  onPress,
  children,
}: {
  onPress: IO<void>
  children?: React.ReactElement | ReadonlyArray<React.ReactElement>
}) => {
  const initialFillProgress = 0.2
  const [layout, setLayout] = React.useState<LayoutRectangle>(emptyLayout)
  const maxSize = Math.sqrt(layout.width ** 2 + layout.height ** 2)
  const fillProgress = useSharedValue(0)
  const opacityProgress = useSharedValue(0)
  const pressPosition = useSharedValue({ x: 0, y: 0 })
  const gesture = Gesture.Tap()
    .shouldCancelWhenOutside(true)
    .maxDuration(5000)
    .onBegin(e => {
      pressPosition.value = { x: e.x, y: e.y }
      opacityProgress.value = 1
      fillProgress.value = initialFillProgress
      fillProgress.value = withTiming(1)
    })
    .onEnd(() => {
      runOnJS(onPress)()
    })
    .onFinalize(() => {
      opacityProgress.value = withTiming(0)
    })
  const animatedStyles = useAnimatedStyle(() => ({
    padding: fillProgress.value * maxSize,
    margin: fillProgress.value * -maxSize,
    left: pressPosition.value.x,
    top: pressPosition.value.y,
    opacity: opacityProgress.value * 0.3,
  }))
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={e => setLayout(e.nativeEvent.layout)}
        style={{ padding: 40, backgroundColor: 'gray', overflow: 'hidden' }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: 'black',
              position: 'absolute',
              borderRadius: maxSize,
            },
            animatedStyles,
          ]}
        />
        {children}
      </Animated.View>
    </GestureDetector>
  )
}
