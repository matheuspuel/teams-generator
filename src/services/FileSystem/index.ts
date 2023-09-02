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
  }) => F.Effect<never, FileSystemError, void>
  cacheDirectory: string
}

export const FileSystemEnv = Context.Tag<FileSystem>()

export const FileSystem = {
  read: (...args: Parameters<FileSystem['read']>) =>
    F.flatMap(FileSystemEnv, env => env.read(...args)),
  write: (...args: Parameters<FileSystem['write']>) =>
    F.flatMap(FileSystemEnv, env => env.write(...args)),
  copy: (...args: Parameters<FileSystem['copy']>) =>
    F.flatMap(FileSystemEnv, env => env.copy(...args)),
  cacheDirectory: F.map(FileSystemEnv, env => env.cacheDirectory),
}

export interface FileSystemError extends Data.Case {
  _tag: 'FileSystemError'
  error: Error
}
export const FileSystemError = Data.tagged<FileSystemError>('FileSystemError')
