import { Effect, Layer, ReadonlyArray, String, pipe } from 'effect'
import * as ExpoFileSystem from 'expo-file-system'
import { enforceErrorInstance } from 'src/utils/Error'
import { FileSystem, FileSystemError } from '.'

export const FileSystemLive = FileSystem.context({
  read: args => read(args),
  write: args =>
    pipe(
      makeDirectory({ uri: getParentDirectoryUri(args.uri) }),
      Effect.tap(() => write(args)),
    ),
  copy: args => copy(args),
  cacheDirectory: () => Effect.succeed(ExpoFileSystem.cacheDirectory ?? ''),
}).pipe(Layer.succeedContext)

const read = (args: { uri: string }) =>
  Effect.tryPromise({
    try: () => ExpoFileSystem.readAsStringAsync(args.uri),
    catch: e => new FileSystemError({ error: enforceErrorInstance(e) }),
  })

const write = (args: { uri: string; data: string }) =>
  Effect.tryPromise({
    try: () => ExpoFileSystem.writeAsStringAsync(args.uri, args.data),
    catch: e => new FileSystemError({ error: enforceErrorInstance(e) }),
  })

const copy = (args: { from: string; to: string }) =>
  Effect.tryPromise({
    try: () => ExpoFileSystem.copyAsync(args),
    catch: e => new FileSystemError({ error: enforceErrorInstance(e) }),
  })

const makeDirectory = (args: { uri: string }) =>
  Effect.logDebug('make dir: ' + args.uri).pipe(
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: () =>
          ExpoFileSystem.makeDirectoryAsync(args.uri, { intermediates: true }),
        catch: e => new FileSystemError({ error: enforceErrorInstance(e) }),
      }),
    ),
  )

const getParentDirectoryUri = (uri: string) =>
  pipe(
    uri,
    String.split('/'),
    ReadonlyArray.dropRight(1),
    ReadonlyArray.join('/'),
  )
