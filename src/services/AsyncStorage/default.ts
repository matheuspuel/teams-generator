import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { Effect, Layer, Option, pipe } from 'effect'
import { AsyncStorage } from '.'

export const AsyncStorageDefault = AsyncStorage.context({
  getItem: (key: string) =>
    pipe(
      Effect.tryPromise(() => RNAsyncStorage.getItem(key)),
      Effect.map(Option.fromNullable),
    ),
  setItem: ({ key, value }: { key: string; value: string }) =>
    Effect.tryPromise(() => RNAsyncStorage.setItem(key, value)),
  removeItem: (key: string) =>
    Effect.tryPromise(() => RNAsyncStorage.removeItem(key)),
}).pipe(Layer.succeedContext)
