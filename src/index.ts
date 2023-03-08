import { get } from '@fp-ts/optic'
import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { StatusBar } from './components/hyperscript/expo'
import { Fragment } from './components/hyperscript/react'
import { AppEnv, EnvProvider } from './Env'
import { LoadedLens } from './redux/slices/core/loading'
import { store, useAppSelector } from './redux/store'
import Router from './routes'
import { runStartupTasks } from './startup'

// eslint-disable-next-line functional/no-expression-statement
void SplashScreen.preventAutoHideAsync()

const env: AppEnv = { store }

// eslint-disable-next-line functional/no-expression-statement
void runStartupTasks(env)()

export const AppIndex = () => EnvProvider({ env })(UI)

const UI_ = () => {
  const loaded = useAppSelector(get(LoadedLens))
  return Fragment([StatusBar({ style: 'dark' }), ...(loaded ? [Router()] : [])])
}

const UI = React.createElement(UI_)
