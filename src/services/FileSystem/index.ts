import { Data, Effect } from 'effect'

export type FileSystemImplementation = {
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

export class FileSystem extends Effect.Tag('FileSystem')<
  FileSystem,
  FileSystemImplementation
>() {}

export class FileSystemError extends Data.TaggedError('FileSystemError')<{
  error: Error
}> {}
