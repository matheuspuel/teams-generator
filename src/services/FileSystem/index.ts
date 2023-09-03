import * as Context from '@effect/data/Context'
import { Data, Effect, F } from 'src/utils/fp'

export type FileSystem = {
  read: (args: { uri: string }) => Effect<never, FileSystemError, string>
  write: (args: {
    uri: string
    data: string
  }) => Effect<never, FileSystemError, void>
  copy: (args: {
    from: string
    to: string
  }) => Effect<never, FileSystemError, void>
  cacheDirectory: () => Effect<never, never, string>
}

export const FileSystemEnv = Context.Tag<FileSystem>()

export const FileSystem = F.serviceFunctions(FileSystemEnv)

export interface FileSystemError extends Data.Case {
  _tag: 'FileSystemError'
  error: Error
}
export const FileSystemError = Data.tagged<FileSystemError>('FileSystemError')
