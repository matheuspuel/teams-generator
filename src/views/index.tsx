import 'react-native-gesture-handler'

import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { useAdjustRootColor } from 'src/contexts/Theme'
import { useSelector } from 'src/hooks/useSelector'
import { Router } from './Router'

export const UIRoot = () => {
  useAdjustRootColor()
  const isLoaded = useSelector(s => s.core.isLoaded)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {isLoaded ? <Router /> : null}
      <AlertToast />
    </GestureHandlerRootView>
  )
}
