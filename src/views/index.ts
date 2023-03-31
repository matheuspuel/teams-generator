import 'react-native-gesture-handler'

import React from 'react'
import { GestureHandlerRootView } from 'src/components/hyperscript/gesture-handler/GestureHandlerRootView'
import { StatusBar } from '../components/hyperscript/expo/StatusBar'
import { RootState } from '../model'
import { Router } from '../routes/Router'
import { AppEnv } from '../services'
import { execute, getRootState, subscribe } from '../services/StateRef'
import { LoadedLens } from '../slices/core/loading'
import { $, RIO, get } from '../utils/fp'

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
    ...(get(LoadedLens)(model) ? [Router({ model })] : []),
  ])
