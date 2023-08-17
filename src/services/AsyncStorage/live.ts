import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { $, Eff, O } from 'fp'
import { AsyncStorage } from '.'

export const AsyncStorageLive: AsyncStorage = {
  getItem: key =>
    $(
      Eff.tryPromise(() => RNAsyncStorage.getItem(key)),
      Eff.map(O.fromNullable),
    ),
  setItem: key => value =>
    Eff.tryPromise(() => RNAsyncStorage.setItem(key, value)),
  removeItem: key => Eff.tryPromise(() => RNAsyncStorage.removeItem(key)),
}
