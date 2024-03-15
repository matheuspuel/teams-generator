/* eslint-disable functional/functional-parameters */
import { Context, Effect, F, Option } from 'fp'

export type AsyncStorage = {
  getItem: (key: string) => Effect<Option<string>, unknown>
  setItem: (args: { key: string; value: string }) => Effect<void, unknown>
  removeItem: (key: string) => Effect<void, unknown>
}

export class AsyncStorageEnv extends Context.Tag('AsyncStorage')<
  AsyncStorageEnv,
  AsyncStorage
>() {}

export const AsyncStorage = F.serviceFunctions(AsyncStorageEnv)
