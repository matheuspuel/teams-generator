import AsyncStorage from '@react-native-async-storage/async-storage'
import { Eff, Effect } from 'fp'

const getItem: (key: string) => Effect<never, unknown, string | null> = key =>
  Eff.tryPromise(() => AsyncStorage.getItem(key))

const setItem: (
  key: string,
) => (value: string) => Effect<never, unknown, void> = key => value =>
  Eff.tryPromise(() => AsyncStorage.setItem(key, value))

const removeItem: (key: string) => Effect<never, void, void> = key =>
  Eff.tryPromise(() => AsyncStorage.removeItem(key))

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
