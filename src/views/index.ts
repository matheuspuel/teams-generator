import 'react-native-gesture-handler'

import { Eq, get, identity } from 'fp'
import { StatusBar } from 'src/components/expo/StatusBar'
import { GestureHandlerRootView } from 'src/components/gesture-handler/GestureHandlerRootView'
import { named1 } from 'src/components/helpers'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { useSelector } from 'src/services/StateRef/react'
import { UIEnv } from 'src/services/UI'
import { Router } from './Router'

export const UIRoot = named1('UIRoot')((env: UIEnv) => {
  const model = useSelector({ selector: identity, eq: Eq.strict(), env })
  return Root(model)(env)
})

const Root = (model: RootState) =>
  GestureHandlerRootView([
    StatusBar({ style: 'dark' }),
    ...(get(root.at('core').at('isLoaded'))(model) ? [Router({ model })] : []),
  ])
