import * as ExpoFileSystem from 'expo-file-system'
import { A, F, Layer, Str, pipe } from 'fp'
import { enforceErrorInstance } from 'src/utils/Error'
import { FileSystemEnv, FileSystemError } from '.'

export const FileSystemLive = FileSystemEnv.context({
  read: args => read(args),
  write: args =>
    pipe(
      makeDirectory({ uri: getParentDirectoryUri(args.uri) }),
      F.tap(() => write(args)),
    ),
  copy: args => copy(args),
  cacheDirectory: ExpoFileSystem.cacheDirectory ?? '',
}).pipe(Layer.succeedContext)

const read = (args: { uri: string }) =>
  F.tryPromise({
    try: () => ExpoFileSystem.readAsStringAsync(args.uri),
    catch: e => FileSystemError({ error: enforceErrorInstance(e) }),
  })

const write = (args: { uri: string; data: string }) =>
  F.tryPromise({
    try: () => ExpoFileSystem.writeAsStringAsync(args.uri, args.data),
    catch: e => FileSystemError({ error: enforceErrorInstance(e) }),
  })

const copy = (args: { from: string; to: string }) =>
  F.tryPromise({
    try: () => ExpoFileSystem.copyAsync(args),
    catch: e => FileSystemError({ error: enforceErrorInstance(e) }),
  })

const makeDirectory = (args: { uri: string }) =>
  F.log('make dir: ' + args.uri).pipe(
    F.flatMap(() =>
      F.tryPromise({
        try: () =>
          ExpoFileSystem.makeDirectoryAsync(args.uri, { intermediates: true }),
        catch: e => FileSystemError({ error: enforceErrorInstance(e) }),
      }),
    ),
  )

const getParentDirectoryUri = (uri: string) =>
  pipe(uri, Str.split('/'), A.dropRight(1), A.join('/'))
