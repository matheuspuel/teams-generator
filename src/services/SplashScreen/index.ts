import { Task } from 'fp'

export type SplashScreen = {
  preventAutoHide: Task<void>
  hide: Task<void>
}

export type SplashScreenEnv = { splashScreen: SplashScreen }

export const SplashScreen = {
  preventAutoHide: (env: SplashScreenEnv) => env.splashScreen.preventAutoHide,
  hide: (env: SplashScreenEnv) => env.splashScreen.hide,
}
