import 'react-native-gesture-handler'

import { Nothing } from 'src/components'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { StatusBar } from 'src/components/expo/StatusBar'
import { GestureHandlerRootView } from 'src/components/gesture-handler/GestureHandlerRootView'
import { namedConst } from 'src/components/hyperscript'
import { useAdjustRootColor } from 'src/contexts/Theme'
import { useSelector } from 'src/hooks/useSelector'
import { Router } from './Router'

export const UIRoot = namedConst('UIRoot')(() => {
  useAdjustRootColor()
  const isLoaded = useSelector(s => s.core.isLoaded)
  return GestureHandlerRootView([
    StatusBar({ style: 'dark' }),
    isLoaded ? Router : Nothing,
    AlertToast,
  ])
})
