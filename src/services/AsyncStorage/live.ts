import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { F, Layer, O, pipe } from 'fp'
import { AsyncStorageEnv } from '.'

export const AsyncStorageLive = AsyncStorageEnv.context({
  getItem: key =>
    pipe(
      F.tryPromise(() => RNAsyncStorage.getItem(key)),
      F.map(O.fromNullable),
    ),
  setItem: ({ key, value }) =>
    F.tryPromise(() => RNAsyncStorage.setItem(key, value)),
  removeItem: key => F.tryPromise(() => RNAsyncStorage.removeItem(key)),
}).pipe(Layer.succeedContext)
