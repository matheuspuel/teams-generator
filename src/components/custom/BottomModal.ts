import { F } from 'fp'
import React from 'react'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { named2 } from 'src/components/hyperscript'
import { Children } from 'src/components/types'
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { Pressable } from '../react-native/Pressable'
import { View } from '../react-native/View'

const ANIMATION_DURATION = 150

export const BottomModal = named2('BottomModal')(
  // eslint-disable-next-line react/display-name
  (props: { onClose: AppEvent }) => (children: Children) => {
    return React.createElement(
      Animated.View,
      {
        entering: FadeIn.duration(ANIMATION_DURATION),
        exiting: FadeOut.duration(ANIMATION_DURATION),
        style: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          elevation: 8,
        },
      },
      View({ flex: 1, bg: Colors.opacity(0.375)(Colors.black) })([
        Pressable({ onPress: F.unit, flex: 1 })([
          Pressable({
            onPress: props?.onClose,
            flex: 1,
            justify: 'end',
            rippleColor: Colors.black,
            rippleOpacity: 0,
          })([
            Pressable({ onPress: F.unit, flexShrink: 1 })([
              React.createElement(
                Animated.View,
                {
                  entering: SlideInDown.duration(ANIMATION_DURATION),
                  exiting: SlideOutDown.duration(ANIMATION_DURATION),
                },
                View({
                  bg: Colors.card,
                  roundT: 8,
                  zIndex: 1,
                  flexShrink: 1,
                })(children),
              ),
            ]),
          ]),
        ]),
      ]),
    )
  },
)
