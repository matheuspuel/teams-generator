import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { Effect, Option, pipe } from 'effect'

export class AsyncStorage extends Effect.Service<AsyncStorage>()(
  'AsyncStorage',
  {
    accessors: true,
    succeed: {
      getItem: (key: string) =>
        pipe(
          Effect.tryPromise(() => RNAsyncStorage.getItem(key)),
          Effect.map(Option.fromNullable),
        ),
      setItem: ({ key, value }: { key: string; value: string }) =>
        Effect.tryPromise(() => RNAsyncStorage.setItem(key, value)),
      removeItem: (key: string) =>
        Effect.tryPromise(() => RNAsyncStorage.removeItem(key)),
    },
  },
) {}
