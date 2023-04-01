import 'react-native-gesture-handler'

import React from 'react'
import { GestureHandlerRootView } from 'src/components/hyperscript/gesture-handler/GestureHandlerRootView'
import { root } from 'src/model/Optics'
import { StatusBar } from '../components/hyperscript/expo/StatusBar'
import { RootState } from '../model'
import { AppEnv } from '../services'
import { execute, getRootState, subscribe } from '../services/StateRef'
import { $, RIO, get } from '../utils/fp'
import { Router } from './Router'

export const UI = ({ env }: { env: AppEnv }) => {
  const [model, setModel] = React.useState(execute(getRootState)(env)())
  // eslint-disable-next-line functional/no-expression-statement
  React.useEffect(() => {
    const subscription = subscribe(
      $(
        execute(getRootState),
        RIO.chainIOK(s => () => setModel(s)),
      ),
    )(env)()
    return subscription.unsubscribe
  }, [])
  return Root(model)(env)
}

const Root = (model: RootState) =>
  GestureHandlerRootView([
    StatusBar({ style: 'dark' }),
    ...(get(root.core.loaded.$)(model) ? [Router({ model })] : []),
  ])
