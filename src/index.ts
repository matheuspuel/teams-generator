import 'react-native-gesture-handler'

import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Fragment } from './components/hyperscript'
import { StatusBar } from './components/hyperscript/expo/StatusBar'
import { RootState } from './model'
import { Router } from './routes/Router'
import { AppEnv } from './services'
import { storeGet } from './services/Store'
import { store } from './services/Store/default'
import { defaultTheme } from './services/Theme/default'
import { LoadedLens } from './slices/core/loading'
import { runStartupTasks } from './startup'
import { $, IO, get } from './utils/fp'

const env: AppEnv = { store, theme: defaultTheme }

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = () => {
  const [model, setModel] = React.useState(storeGet(env)())
  // eslint-disable-next-line functional/no-expression-statement
  React.useEffect(() => {
    const subscription = env.store.subscribe(
      $(
        storeGet(env),
        IO.chain(s => () => setModel(s)),
      ),
    )
    return subscription.unsubscribe
  }, [])
  return React.createElement(
    GestureHandlerRootView,
    { style: { flex: 1 } },
    UI(model)(env),
  )
}

const UI = (model: RootState) =>
  Fragment([
    StatusBar({ style: 'dark' }),
    ...(get(LoadedLens)(model) ? [Router({ model })] : []),
  ])
