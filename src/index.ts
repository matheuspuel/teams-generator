import { get } from '@fp-ts/optic'
import React from 'react'
import { StatusBar } from './components/hyperscript/expo'
import { Fragment } from './components/hyperscript/react'
import { AppEnv } from './Env'
import { storeGet } from './redux'
import { LoadedLens } from './redux/slices/core/loading'
import { RootState, store } from './redux/store'
import { Router } from './routes/Router'
import { runStartupTasks } from './startup'
import { $, IO } from './utils/fp'

const env: AppEnv = { store }

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = () => {
  const [model, setModel] = React.useState(storeGet(env)())
  // eslint-disable-next-line functional/no-expression-statement
  React.useEffect(() => {
    const subscription = env.store.subscribe(() =>
      $(
        storeGet(env),
        IO.chain(s => () => setModel(s)),
      ),
    )
    return subscription.unsubscribe
  }, [])
  return UI(model)(env)
}

const UI = (model: RootState) =>
  Fragment([
    StatusBar({ style: 'dark' }),
    ...(get(LoadedLens)(model) ? [Router({ model })] : []),
  ])
