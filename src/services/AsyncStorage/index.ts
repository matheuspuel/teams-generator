import { Effect, Option } from 'effect'
import { UnknownException } from 'effect/Cause'

export class AsyncStorage extends Effect.Tag('AsyncStorage')<
  AsyncStorage,
  {
    getItem: (
      key: string,
    ) => Effect.Effect<Option.Option<string>, UnknownException>
    setItem: ({
      key,
      value,
    }: {
      key: string
      value: string
    }) => Effect.Effect<void, UnknownException>
    removeItem: (key: string) => Effect.Effect<void, UnknownException>
  }
>() {}
