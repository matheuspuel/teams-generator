/* eslint-disable functional/functional-parameters */
import { Context, Effect, F, Option } from 'fp'

export type AsyncStorage = {
  getItem: (key: string) => Effect<never, unknown, Option<string>>
  setItem: (args: {
    key: string
    value: string
  }) => Effect<never, unknown, void>
  removeItem: (key: string) => Effect<never, unknown, void>
}

export const AsyncStorageEnv = Context.Tag<AsyncStorage>()

export const AsyncStorage = F.serviceFunctions(AsyncStorageEnv)
