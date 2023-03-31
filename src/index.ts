import 'react-native-gesture-handler'

import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Fragment } from './components/hyperscript'
import { StatusBar } from './components/hyperscript/expo/StatusBar'
import { RootState } from './model'
import { Router } from './routes/Router'
import { AppEnv } from './services'
import { execute, getRootState, subscribe } from './services/StateRef'
import { defaultStateRef } from './services/StateRef/default'
import { defaultTheme } from './services/Theme/default'
import { LoadedLens } from './slices/core/loading'
import { runStartupTasks } from './startup'
import { $, RIO, get } from './utils/fp'

const env: AppEnv = { stateRef: defaultStateRef, theme: defaultTheme }

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = () => {
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
