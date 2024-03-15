import AsyncStorage from '@react-native-async-storage/async-storage'
import { Effect, F } from 'fp'

const getItem: (key: string) => Effect<string | null, unknown> = key =>
  F.tryPromise(() => AsyncStorage.getItem(key))

const setItem: (key: string) => (value: string) => Effect<void, unknown> =
  key => value =>
    F.tryPromise(() => AsyncStorage.setItem(key, value))

const removeItem: (key: string) => Effect<void, void> = key =>
  F.tryPromise(() => AsyncStorage.removeItem(key))

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
