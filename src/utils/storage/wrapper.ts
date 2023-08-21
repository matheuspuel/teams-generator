import AsyncStorage from '@react-native-async-storage/async-storage'
import { F, Effect } from 'fp'

const getItem: (key: string) => Effect<never, unknown, string | null> = key =>
  F.tryPromise(() => AsyncStorage.getItem(key))

const setItem: (
  key: string,
) => (value: string) => Effect<never, unknown, void> = key => value =>
  F.tryPromise(() => AsyncStorage.setItem(key, value))

const removeItem: (key: string) => Effect<never, void, void> = key =>
  F.tryPromise(() => AsyncStorage.removeItem(key))

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
