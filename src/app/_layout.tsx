import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { useAdjustRootColor, useThemeGetRawColor } from 'src/contexts/Theme'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'

export default function Layout() {
  useAdjustRootColor()
  const getRawColor = useThemeGetRawColor()
  const isLoaded = useSelector(s => s.core.isLoaded)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {isLoaded ? (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: getRawColor(Colors.header) },
            headerTintColor: getRawColor(Colors.text.light),
            contentStyle: { backgroundColor: getRawColor(Colors.background) },
          }}
        />
      ) : null}
      <AlertToast />
    </GestureHandlerRootView>
  )
}
