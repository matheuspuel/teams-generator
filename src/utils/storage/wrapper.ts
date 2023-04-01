import AsyncStorage from '@react-native-async-storage/async-storage'
import { constVoid, identity, TE } from 'fp'

const getItem: (key: string) => TE.TaskEither<unknown, string | null> = key =>
  TE.tryCatch(() => AsyncStorage.getItem(key), identity)

const setItem: (
  key: string,
) => (value: string) => TE.TaskEither<unknown, void> = key => value =>
  TE.tryCatch(() => AsyncStorage.setItem(key, value), identity)

const removeItem: (key: string) => TE.TaskEither<void, void> = key =>
  TE.tryCatch(() => AsyncStorage.removeItem(key), constVoid)

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
