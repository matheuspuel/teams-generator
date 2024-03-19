/* eslint-disable functional/functional-parameters */
import { Context, Effect, Option } from 'effect'

export type AsyncStorage = {
  getItem: (key: string) => Effect.Effect<Option.Option<string>, unknown>
  setItem: (args: {
    key: string
    value: string
  }) => Effect.Effect<void, unknown>
  removeItem: (key: string) => Effect.Effect<void, unknown>
}

export class AsyncStorageEnv extends Context.Tag('AsyncStorage')<
  AsyncStorageEnv,
  AsyncStorage
>() {}

export const AsyncStorage = Effect.serviceFunctions(AsyncStorageEnv)
