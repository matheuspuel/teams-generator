/* eslint-disable functional/functional-parameters */
import { Context, Effect, F, Option } from 'fp'

export type AsyncStorage = {
  getItem: (key: string) => Effect<never, unknown, Option<string>>
  setItem: (key: string) => (value: string) => Effect<never, unknown, void>
  removeItem: (key: string) => Effect<never, unknown, void>
}

export const AsyncStorageEnv = Context.Tag<AsyncStorage>()

export const AsyncStorage = {
  getItem: (...args: Parameters<AsyncStorage['getItem']>) =>
    F.flatMap(AsyncStorageEnv, env => env.getItem(...args)),
  setItem:
    (...args: Parameters<AsyncStorage['setItem']>) =>
    (...args2: Parameters<ReturnType<AsyncStorage['setItem']>>) =>
      F.flatMap(AsyncStorageEnv, env => env.setItem(...args)(...args2)),
  removeItem: (...args: Parameters<AsyncStorage['removeItem']>) =>
    F.flatMap(AsyncStorageEnv, env => env.removeItem(...args)),
}
