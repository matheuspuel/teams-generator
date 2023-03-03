import { get } from '@fp-ts/optic'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
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

export const AppIndex = () => (
  <EnvProvider env={env}>
    <UI />
  </EnvProvider>
)

const UI = () => {
  const loaded = useAppSelector(get(LoadedLens))
  return (
    <>
      <StatusBar style="dark" />
      {loaded && <Router />}
    </>
  )
}
