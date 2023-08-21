import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { $, F, O } from 'fp'
import { AsyncStorage } from '.'

export const AsyncStorageLive: AsyncStorage = {
  getItem: key =>
    $(
      F.tryPromise(() => RNAsyncStorage.getItem(key)),
      F.map(O.fromNullable),
    ),
  setItem: key => value =>
    F.tryPromise(() => RNAsyncStorage.setItem(key, value)),
  removeItem: key => F.tryPromise(() => RNAsyncStorage.removeItem(key)),
}
