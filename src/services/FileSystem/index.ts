import { Array, Data, Effect, String, pipe } from 'effect'
import * as ExpoFileSystem from 'expo-file-system'
import { enforceErrorInstance } from 'src/utils/Error'

export class FileSystem extends Effect.Service<FileSystem>()('FileSystem', {
  accessors: true,
  succeed: {
    read: (args: { uri: string }) => read(args),
    write: (args: { uri: string; data: string }) =>
      pipe(
        makeDirectory({ uri: getParentDirectoryUri(args.uri) }),
        Effect.tap(() => write(args)),
      ),
    copy: (args: { from: string; to: string }) => copy(args),
    cacheDirectory: () => Effect.succeed(ExpoFileSystem.cacheDirectory ?? ''),
  },
}) {}

export class FileSystemError extends Data.TaggedError('FileSystemError')<{
  cause: Error
}> {}

const read = (args: { uri: string }) =>
  Effect.tryPromise({
    try: () => ExpoFileSystem.readAsStringAsync(args.uri),
    catch: e => new FileSystemError({ cause: enforceErrorInstance(e) }),
  })

const write = (args: { uri: string; data: string }) =>
  Effect.tryPromise({
    try: () => ExpoFileSystem.writeAsStringAsync(args.uri, args.data),
    catch: e => new FileSystemError({ cause: enforceErrorInstance(e) }),
  })

const copy = (args: { from: string; to: string }) =>
  Effect.tryPromise({
    try: () => ExpoFileSystem.copyAsync(args),
    catch: e => new FileSystemError({ cause: enforceErrorInstance(e) }),
  })

const makeDirectory = (args: { uri: string }) =>
  Effect.logDebug('make dir: ' + args.uri).pipe(
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: () =>
          ExpoFileSystem.makeDirectoryAsync(args.uri, { intermediates: true }),
        catch: e => new FileSystemError({ cause: enforceErrorInstance(e) }),
      }),
    ),
  )

const getParentDirectoryUri = (uri: string) =>
  pipe(uri, String.split('/'), Array.dropRight(1), Array.join('/'))
