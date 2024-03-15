import * as Context from 'effect/Context'
import { Data, Effect, F } from 'src/utils/fp'

export type FileSystem = {
  read: (args: { uri: string }) => Effect<string, FileSystemError>
  write: (args: { uri: string; data: string }) => Effect<void, FileSystemError>
  copy: (args: { from: string; to: string }) => Effect<void, FileSystemError>
  cacheDirectory: () => Effect<string>
}

export class FileSystemEnv extends Context.Tag('FileSystem')<
  FileSystemEnv,
  FileSystem
>() {}

export const FileSystem = F.serviceFunctions(FileSystemEnv)

export class FileSystemError extends Data.TaggedError('FileSystemError')<{
  error: Error
}> {}
