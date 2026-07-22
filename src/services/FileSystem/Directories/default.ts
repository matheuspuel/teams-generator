import { Layer } from 'effect'
import * as ExpoFileSystem from 'expo-file-system'
import { FileSystemDirectories } from '.'

export const FileSystemDirectoriesExpo = Layer.succeed(FileSystemDirectories, {
  document: ExpoFileSystem.Paths.document.uri,
  cache: ExpoFileSystem.Paths.cache.uri,
})
