import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { Effect, Layer } from 'effect'
import { AsyncStorage } from '.'

export const AsyncStorageDefault = AsyncStorage.context({
  getItem: (key: string) =>
    Effect.tryPromise(() => RNAsyncStorage.getItem(key)),
  setItem: ({ key, value }: { key: string; value: string }) =>
    Effect.tryPromise(() => RNAsyncStorage.setItem(key, value)),
  removeItem: (key: string) =>
    Effect.tryPromise(() => RNAsyncStorage.removeItem(key)),
}).pipe(Layer.succeedContext)
