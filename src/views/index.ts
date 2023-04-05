import 'react-native-gesture-handler'

import { Eq, R, get, identity } from 'fp'
import { named1 } from 'src/components/helpers'
import { StatusBar } from 'src/components/hyperscript/expo/StatusBar'
import { GestureHandlerRootView } from 'src/components/hyperscript/gesture-handler/GestureHandlerRootView'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { AppStateRefEnv } from 'src/services/StateRef'
import { useSelector } from 'src/services/StateRef/react'
import { Router } from './Router'

export const UIRoot = named1('UI')((env: UIRootEnv & AppStateRefEnv) => {
  const model = useSelector({ selector: identity, eq: Eq.eqStrict, env })
  return Root(model)(env)
})

type UIRootEnv = R.EnvType<ReturnType<typeof Root>>

const Root = (model: RootState) =>
  GestureHandlerRootView([
    StatusBar({ style: 'dark' }),
    ...(get(root.core.loaded.$)(model) ? [Router({ model })] : []),
  ])
