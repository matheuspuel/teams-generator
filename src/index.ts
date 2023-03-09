import { get } from '@fp-ts/optic'
import React from 'react'
import { StatusBar } from './components/hyperscript/expo'
import { Fragment } from './components/hyperscript/react'
import { AppEnv, EnvProvider } from './Env'
import { LoadedLens } from './redux/slices/core/loading'
import { store, useAppSelector } from './redux/store'
import { Router } from './routes/Router'
import { runStartupTasks } from './startup'
import { identity } from './utils/fp'

const env: AppEnv = { store }

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = () => EnvProvider({ env })(UI)

const UI_ = () => {
  const loaded = useAppSelector(get(LoadedLens))
  const model = useAppSelector(identity)
  return Fragment([
    StatusBar({ style: 'dark' }),
    ...(loaded ? [Router({ model })] : []),
  ])(env)
}

const UI = React.createElement(UI_)
