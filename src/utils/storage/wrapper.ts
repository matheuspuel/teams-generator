import AsyncStorage from '@react-native-async-storage/async-storage'
import { constVoid } from 'fp-ts/lib/function'
import { TE } from 'src/utils/fp-ts'

const getItem: (key: string) => TE.TaskEither<void, string | null> = key =>
  TE.tryCatch(() => AsyncStorage.getItem(key), constVoid)

const setItem: (key: string) => (value: string) => TE.TaskEither<void, void> =
  key => value =>
    TE.tryCatch(() => AsyncStorage.setItem(key, value), constVoid)

const removeItem: (key: string) => TE.TaskEither<void, void> = key =>
  TE.tryCatch(() => AsyncStorage.removeItem(key), constVoid)

export const AsyncStorageFP = {
  getItem,
  setItem,
  removeItem,
}
