import { Effect } from 'effect'
import * as React from 'react'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { FlexContainerProps, MarginProps, UIColor } from 'src/components/types'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { Pressable } from '../react-native/Pressable'
import { View } from '../react-native/View'

const ANIMATION_DURATION = 150

export const Modal = (
  props: FlexContainerProps &
    MarginProps & {
      onClose: AppEvent
      bg?: UIColor
      entering?: React.ComponentProps<typeof Animated.View>['entering']
      exiting?: React.ComponentProps<typeof Animated.View>['exiting']
      children: React.ReactNode
    },
) => {
  return (
    <Animated.View
      entering={FadeIn.duration(ANIMATION_DURATION)}
      exiting={FadeOut.duration(ANIMATION_DURATION)}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        elevation: 8,
      }}
    >
      <View flex={1} bg={Colors.opacity(0.375)(Colors.black)}>
        <Pressable onPress={Effect.void} flex={1}>
          <Pressable
            onPress={props?.onClose}
            rippleColor={Colors.black}
            rippleOpacity={0}
            flex={1}
            direction={props.direction}
            justify={props.justify ?? 'center'}
            align={props.align}
          >
            <Animated.View
              entering={
                props.entering ?? SlideInDown.duration(ANIMATION_DURATION)
              }
              exiting={
                props.exiting ?? SlideOutDown.duration(ANIMATION_DURATION)
              }
            >
              <Pressable
                onPress={Effect.void}
                flexShrink={1}
                m={props?.m}
                mx={props?.mx}
                my={props?.my}
                ml={props?.ml}
                mr={props?.mr}
                mt={props?.mt}
                mb={props?.mb}
              >
                <View
                  bg={props.bg ?? Colors.card}
                  round={8}
                  zIndex={1}
                  flexShrink={1}
                >
                  {props.children}
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </View>
    </Animated.View>
  )
}
