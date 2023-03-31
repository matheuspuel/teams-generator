import React from 'react'
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
import { Fragment, Txt, View } from 'src/components/hyperscript'
import { Rating } from 'src/datatypes'
import { AppThemeEnv, Colors } from 'src/services/Theme'
import { Color } from 'src/utils/datatypes'
import { $, apply, R, RA, ReaderIO } from 'src/utils/fp'

export type RatingSliderProps<R extends unknown> = {
  initialPercentage: number
  step: number
  onChange: (percentage: number) => ReaderIO<R, void>
}

export type RatingSliderArgs<R extends unknown> = {
  x: RatingSliderProps<R>
  env: R
}

const RatingSlider_ = <R extends unknown>({
  x: { initialPercentage, step, onChange: onChange_ },
  env,
}: RatingSliderArgs<R & AppThemeEnv>) => {
  const paddingHorizontal = 16
  const paddingVertical = 40
  const trackWidth = 10
  const thumbSize = 30
  const tickWidth = 4
  const trackColor = Colors.primary.$2
  const thumbColor = Colors.primary.$5
  const [width, setWidth] = React.useState(0)
  const position = useSharedValue(0)

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

  const onChange = $(onChange_, R.map(apply(env)), R.map(apply(null)))

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
          marginTop: -20,
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
            backgroundColor: Color.toHex(trackColor(env)),
          }}
        >
          {$(
            Rating.List,
            RA.map(r =>
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
                          Txt({
                            align: 'center',
                            size: 12,
                            color: trackColor,
                            weight: 900,
                          })(r.toString()),
                        ]),
                      ]
                    : []),
                ]),
              ]),
            ),
            Fragment,
          )(env)}
          <Animated.View
            style={[
              {
                marginTop: (trackWidth - thumbSize) / 2,
                marginLeft: (trackWidth + tickWidth - thumbSize) / 2,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: Color.toHex(thumbColor(env)),
              },
              animatedStyles,
            ]}
          />
        </Animated.View>
      </View_>
    </GestureDetector>
  )
}

export const RatingSlider =
  <R extends unknown>(props: RatingSliderProps<R>) =>
  (env: R & AppThemeEnv) =>
    React.createElement(RatingSlider_<R>, { x: props, env })
