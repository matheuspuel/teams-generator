import AsyncStorage from '@react-native-async-storage/async-storage'
import { Eff, Effect, constVoid, identity } from 'fp'

const getItem: (key: string) => Effect<never, unknown, string | null> = key =>
  Eff.tryCatchPromise(() => AsyncStorage.getItem(key), identity)

const setItem: (
  key: string,
) => (value: string) => Effect<never, unknown, void> = key => value =>
  Eff.tryCatchPromise(() => AsyncStorage.setItem(key, value), identity)

const removeItem: (key: string) => Effect<never, void, void> = key =>
  Eff.tryCatchPromise(() => AsyncStorage.removeItem(key), constVoid)

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
