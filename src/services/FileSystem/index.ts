import { Data, Effect } from 'effect'
import * as Context from 'effect/Context'

export type FileSystem = {
  read: (args: { uri: string }) => Effect.Effect<string, FileSystemError>
  write: (args: {
    uri: string
    data: string
  }) => Effect.Effect<void, FileSystemError>
  copy: (args: {
    from: string
    to: string
  }) => Effect.Effect<void, FileSystemError>
  cacheDirectory: () => Effect.Effect<string>
}

export class FileSystemEnv extends Context.Tag('FileSystem')<
  FileSystemEnv,
  FileSystem
>() {}

export const FileSystem = Effect.serviceFunctions(FileSystemEnv)

export class FileSystemError extends Data.TaggedError('FileSystemError')<{
  error: Error
}> {}
