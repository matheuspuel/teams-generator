/* eslint-disable functional/functional-parameters */
import { Effect, Option } from 'effect'

export type AsyncStorageImplementation = {
  getItem: (key: string) => Effect.Effect<Option.Option<string>, unknown>
  setItem: (args: {
    key: string
    value: string
  }) => Effect.Effect<void, unknown>
  removeItem: (key: string) => Effect.Effect<void, unknown>
}

export class AsyncStorage extends Effect.Tag('AsyncStorage')<
  AsyncStorage,
  AsyncStorageImplementation
>() {}
