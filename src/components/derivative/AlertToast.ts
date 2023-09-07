import { absurd } from 'fp'
import * as React from 'react'
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { MaterialIcons, Pressable, Txt, View } from 'src/components'
import { appEvents } from 'src/events'
import { Colors } from 'src/services/Theme'
import { named2 } from '../helpers'

const ANIMATION_DURATION = 200

export const AlertToast = named2('AlertToast')(
  (props: { title: string; message: string; type: 'error' | 'success' }) =>
    View({
      absolute: { top: 0, bottom: 0, left: 0, right: 0 },
      justify: 'end',
    })([
      env =>
        React.createElement(
          Animated.View,
          {
            entering: SlideInRight.duration(ANIMATION_DURATION),
            exiting: SlideOutRight.duration(ANIMATION_DURATION),
          },
          Pressable({
            onPress: appEvents.alert.dismiss(),
            bg: Colors.white,
            m: 16,
            mb: 48,
            round: 8,
            shadow: 2,
            direction: 'row',
          })([
            View({
              bg:
                props.type === 'error'
                  ? Colors.danger.$1
                  : props.type === 'success'
                  ? Colors.primary.$1
                  : absurd<never>(props.type),
              p: 8,
              roundL: 8,
              justify: 'center',
            })([
              props.type === 'error'
                ? MaterialIcons({
                    name: 'error-outline',
                    color: Colors.danger.$7,
                    size: 36,
                  })
                : props.type === 'success'
                ? MaterialIcons({
                    name: 'check-circle-outline',
                    color: Colors.primary.$7,
                    size: 36,
                  })
                : absurd<never>(props.type),
            ]),
            View({ gap: 4, flex: 1, p: 8 })([
              Txt({ align: 'left', weight: 700, size: 16 })(props.title),
              Txt({ align: 'left' })(props.message),
            ]),
          ])(env),
        ),
    ]),
)
