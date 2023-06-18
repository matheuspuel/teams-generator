import RNAsyncStorage from '@react-native-async-storage/async-storage'
import { $, Eff, O, identity } from 'fp'
import { AsyncStorage } from '.'

export const AsyncStorageLive: AsyncStorage = {
  getItem: key =>
    $(
      Eff.tryCatchPromise(() => RNAsyncStorage.getItem(key), identity),
      Eff.map(O.fromNullable),
    ),
  setItem: key => value =>
    Eff.tryCatchPromise(() => RNAsyncStorage.setItem(key, value), identity),
  removeItem: key =>
    Eff.tryCatchPromise(() => RNAsyncStorage.removeItem(key), identity),
}
