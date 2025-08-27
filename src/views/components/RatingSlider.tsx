import { Array, Runtime, pipe } from 'effect'
import * as React from 'react'
import { View as View_ } from 'react-native'
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
import { Fragment, Txt, View } from 'src/components'
import { UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { Rating } from 'src/datatypes'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'

export type RatingSliderProps = {
  initialPercentage: number
  step: number
  onChange: (percentage: number) => AppEvent
}

const RatingSlider_ = ({
  initialPercentage,
  step,
  onChange: onChange_,
}: RatingSliderProps) => {
  const paddingHorizontal = 16
  const paddingVertical = 25
  const trackWidth = 10
  const thumbSize = 30
  const tickWidth = 4
  const trackColor = Colors.tone(-0.67)(Colors.primary)
  const thumbColor = Colors.primary
  const [width, setWidth] = React.useState(0)
  const position = useSharedValue(0)
  const runtime = useRuntime()
  const getRawColor = useThemeGetRawColor()

  const getPosition = (
    e: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ) => {
    'worklet'
    return Math.max(
      0,
      Math.min(e.x - paddingHorizontal - (trackWidth + tickWidth) / 2, width),
    )
  }

  const getResultPercentage = (
    e: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ) => {
    'worklet'
    const p = getPosition(e)
    const v = p / width
    return Math.round(v / step) * step
  }

  const onChange = (n: number) => Runtime.runPromise(runtime)(onChange_(n))

  const gesture = Gesture.Pan()
    .onBegin(e => {
      const n = getResultPercentage(e)
      position.value = withTiming(n * width)
    })
    .onUpdate(e => {
      position.value = getPosition(e)
    })
    .onFinalize(e => {
      const n = getResultPercentage(e)
      position.value = withTiming(n * width)
      runOnJS(onChange)(n)
    })
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }))
  return (
    <GestureDetector gesture={gesture}>
      <View_
        style={{
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          marginTop: -10,
        }}
      >
        <Animated.View
          onLayout={e => {
            const width = e.nativeEvent.layout.width - trackWidth - tickWidth
            setWidth(width)
            position.value = initialPercentage * width
          }}
          style={{
            height: trackWidth,
            borderRadius: trackWidth / 2,
            backgroundColor: getRawColor(trackColor),
          }}
        >
          {pipe(
            Rating.List,
            Array.map(r =>
              View({
                key: r.toString(),
                absolute: {
                  top: 0,
                  left: (r / 10) * width + (trackWidth + tickWidth) / 2,
                },
              })([
                View({
                  absolute: { top: trackWidth, left: 0, right: 0 },
                  align: 'center',
                })([
                  View({
                    h: r % 1 === 0 ? 9 : 5,
                    w: tickWidth,
                    bg: trackColor,
                    roundT: 0,
                    roundB: tickWidth,
                  })([]),
                  ...(r % 1 === 0
                    ? [
                        View({ w: 40 })([
                          Txt({ size: 12, color: trackColor, weight: 900 })(
                            r.toString(),
                          ),
                        ]),
                      ]
                    : []),
                ]),
              ]),
            ),
            Fragment,
          )}
          <Animated.View
            style={[
              {
                marginTop: (trackWidth - thumbSize) / 2,
                marginLeft: (trackWidth + tickWidth - thumbSize) / 2,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: getRawColor(thumbColor),
              },
              animatedStyles,
            ]}
          />
        </Animated.View>
      </View_>
    </GestureDetector>
  )
}

export const RatingSlider = (props: RatingSliderProps): UIElement =>
  // eslint-disable-next-line react/display-name
  React.createElement(RatingSlider_, props)
