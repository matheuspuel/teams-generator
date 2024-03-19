import AsyncStorage from '@react-native-async-storage/async-storage'
import { Effect } from 'effect'

const getItem: (key: string) => Effect.Effect<string | null, unknown> = key =>
  Effect.tryPromise(() => AsyncStorage.getItem(key))

const setItem: (
  key: string,
) => (value: string) => Effect.Effect<void, unknown> = key => value =>
  Effect.tryPromise(() => AsyncStorage.setItem(key, value))

const removeItem: (key: string) => Effect.Effect<void, void> = key =>
  Effect.tryPromise(() => AsyncStorage.removeItem(key))

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
