import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { RootBackgroundStyle, useTheme } from 'src/contexts/Theme'
import { useAppLoading } from 'src/state/appLoading'

export default function Layout() {
  const { colors } = useTheme()
  const isAppLoading = useAppLoading()
  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <RootBackgroundStyle color={colors.background.toHex()} />
        {isAppLoading ? null : (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.header.toHex() },
              headerTintColor: colors.text.light.toHex(),
              contentStyle: { backgroundColor: colors.background.toHex() },
            }}
          />
        )}
        <AlertToast />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
