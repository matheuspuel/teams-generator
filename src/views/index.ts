import 'react-native-gesture-handler'

import { StatusBar } from 'src/components/expo/StatusBar'
import { GestureHandlerRootView } from 'src/components/gesture-handler/GestureHandlerRootView'
import { named1 } from 'src/components/helpers'
import { select } from 'src/services/StateRef/react'
import { Router } from './Router'

export const UIRoot = named1('UIRoot')(
  select(s => s.core.isLoaded)(isLoaded =>
    GestureHandlerRootView([
      StatusBar({ style: 'dark' }),
      ...(isLoaded ? [Router] : []),
    ]),
  ),
)
