import 'react-native-gesture-handler'

import { AlertToast } from 'src/components/derivative/AlertToast'
import { StatusBar } from 'src/components/expo/StatusBar'
import { GestureHandlerRootView } from 'src/components/gesture-handler/GestureHandlerRootView'
import { namedConst } from 'src/components/hyperscript'
import { useSelector } from 'src/hooks/useSelector'
import { Router } from './Router'

export const UIRoot = namedConst('UIRoot')(() => {
  const isLoaded = useSelector(s => s.core.isLoaded)
  return GestureHandlerRootView([
    StatusBar({ style: 'dark' }),
    ...(isLoaded ? [Router] : []),
    AlertToast,
  ])
})
