import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { useAdjustRootColor, useThemeGetRawColor } from 'src/contexts/Theme'
import { Colors } from 'src/services/Theme'
import { useAppLoading } from 'src/state/appLoading'

export default function Layout() {
  useAdjustRootColor()
  const getRawColor = useThemeGetRawColor()
  const isAppLoading = useAppLoading()
  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {isAppLoading ? null : (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: getRawColor(Colors.header) },
              headerTintColor: getRawColor(Colors.text.light),
              contentStyle: { backgroundColor: getRawColor(Colors.background) },
            }}
          />
        )}
        <AlertToast />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
