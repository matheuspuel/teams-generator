import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { Effect, Layer, Option, pipe } from 'effect'
import { AsyncStorage } from '.'

export const AsyncStorageLive = AsyncStorage.context({
  getItem: key =>
    pipe(
      Effect.tryPromise(() => RNAsyncStorage.getItem(key)),
      Effect.map(Option.fromNullable),
    ),
  setItem: ({ key, value }) =>
    Effect.tryPromise(() => RNAsyncStorage.setItem(key, value)),
  removeItem: key => Effect.tryPromise(() => RNAsyncStorage.removeItem(key)),
}).pipe(Layer.succeedContext)
