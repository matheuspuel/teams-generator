import { O, absurd } from 'fp'
import * as React from 'react'
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { MaterialIcons, Nothing, Pressable, Txt, View } from 'src/components'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { memoizedConst } from '../helpers'

const ANIMATION_DURATION = 200

export const AlertToast = memoizedConst('AlertToast')(() => {
  const alert = useSelector(s => s.alert)
  return O.match(alert, {
    onNone: () => Nothing,
    onSome: alert =>
      View({
        absolute: { top: 0, bottom: 0, left: 0, right: 0 },
        justify: 'end',
      })([
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
                alert.type === 'error'
                  ? Colors.danger.$1
                  : alert.type === 'success'
                  ? Colors.primary.$1
                  : absurd<never>(alert.type),
              p: 8,
              roundL: 8,
              justify: 'center',
            })([
              alert.type === 'error'
                ? MaterialIcons({
                    name: 'error-outline',
                    color: Colors.danger.$7,
                    size: 36,
                  })
                : alert.type === 'success'
                ? MaterialIcons({
                    name: 'check-circle-outline',
                    color: Colors.primary.$7,
                    size: 36,
                  })
                : absurd<never>(alert.type),
            ]),
            View({ gap: 4, flex: 1, p: 8 })([
              Txt({ align: 'left', weight: 700, size: 16 })(alert.title),
              Txt({ align: 'left' })(alert.message),
            ]),
          ]),
        ),
      ]),
  })
})
