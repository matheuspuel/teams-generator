import { absurd } from 'effect'
import React from 'react'
import { KeyboardController } from 'react-native-keyboard-controller'
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons, Pressable, Txt, View } from 'src/components'
import { useRuntime } from 'src/contexts/Runtime'
import { useTheme } from 'src/contexts/Theme'
import { Alert } from 'src/services/Alert'
import { useAlertState } from 'src/state/alert'

const ANIMATION_DURATION = 200

export const AlertToast = () => {
  const runtime = useRuntime()
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const alert = useAlertState(_ => _)
  React.useEffect(() => {
    if (alert) {
      KeyboardController.dismiss()
    }
  }, [alert])
  return alert === null ? null : (
    <View justify="end" absolute={insets}>
      <Animated.View
        entering={SlideInRight.duration(ANIMATION_DURATION)}
        exiting={SlideOutRight.duration(ANIMATION_DURATION)}
      >
        <Pressable
          onPress={() => Alert.dismiss().pipe(runtime.runPromiseExit)}
          bg={colors.card}
          m={16}
          mb={48}
          round={8}
          shadow={2}
          direction="row"
        >
          <View
            bg={
              alert.type === 'error'
                ? colors.tone(-0.8)(colors.error)
                : alert.type === 'success'
                  ? colors.tone(-0.8)(colors.success)
                  : absurd<never>(alert.type)
            }
            p={8}
            roundL={8}
            justify="center"
          >
            {alert.type === 'error' ? (
              <MaterialIcons
                name="error-outline"
                color={colors.tone(0.33)(colors.error)}
                size={36}
              />
            ) : alert.type === 'success' ? (
              <MaterialIcons
                name="check-circle-outline"
                color={colors.tone(0.33)(colors.success)}
                size={36}
              />
            ) : (
              absurd<never>(alert.type)
            )}
          </View>
          <View gap={4} flex={1} p={8}>
            <Txt align="left" weight={700} size={16}>
              {alert.title}
            </Txt>
            <Txt align="left">{alert.message}</Txt>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  )
}
