import { FileSystem } from '@effect/platform'
import { SystemError } from '@effect/platform/Error'
import { Effect, Layer, Option } from 'effect'
import * as ExpoFileSystem from 'expo-file-system'

export const FileSystemExpo = Layer.succeed(
  FileSystem.FileSystem,
  FileSystem.make({
    access: (path, _options) =>
      Effect.gen(function* () {
        const exists = yield* Effect.try({
          try: () => new ExpoFileSystem.File(path).exists,
          catch: e =>
            new SystemError({
              method: 'access',
              module: 'FileSystem',
              reason: 'Unknown',
              cause: e,
              pathOrDescriptor: path,
            }),
        })
        if (exists) return yield* Effect.void
        return yield* Effect.fail(
          new SystemError({
            method: 'access',
            module: 'FileSystem',
            reason: 'NotFound',
            pathOrDescriptor: path,
            description: 'No such file or directory',
          }),
        )
      }),
    chmod: () => Effect.die('not implemented'),
    chown: () => Effect.die('not implemented'),
    copy: () => Effect.die('not implemented'),
    copyFile: (from, to) =>
      Effect.tryPromise({
        try: () =>
          new ExpoFileSystem.File(from).copy(new ExpoFileSystem.File(to)),
        catch: e =>
          new SystemError({
            method: 'copyFile',
            module: 'FileSystem',
            reason: 'Unknown',
            cause: e,
            pathOrDescriptor: `from: ${from}, to: ${to}`,
          }),
      }),
    link: () => Effect.die('not implemented'),
    makeDirectory: (path, options) =>
      Effect.try({
        try: () =>
          new ExpoFileSystem.Directory(path).create({
            intermediates: options?.recursive,
            idempotent: true,
          }),
        catch: e =>
          new SystemError({
            method: 'makeDirectory',
            module: 'FileSystem',
            reason: 'Unknown',
            cause: e,
            pathOrDescriptor: path,
          }),
      }),
    makeTempDirectory: () => Effect.die('not implemented'),
    makeTempDirectoryScoped: () => Effect.die('not implemented'),
    makeTempFile: () => Effect.die('not implemented'),
    makeTempFileScoped: () => Effect.die('not implemented'),
    open: () => Effect.die('not implemented'),
    readDirectory: () => Effect.die('not implemented'),
    readFile: path =>
      Effect.tryPromise({
        try: () => new ExpoFileSystem.File(path).bytes(),
        catch: e =>
          new SystemError({
            method: 'readFile',
            module: 'FileSystem',
            reason: 'Unknown',
            cause: e,
            pathOrDescriptor: path,
          }),
      }),
    readLink: () => Effect.die('not implemented'),
    realPath: () => Effect.die('not implemented'),
    remove: (path, options) =>
      Effect.try({
        try: () => new ExpoFileSystem.File(path).delete(),
        catch: e =>
          new SystemError({
            method: 'remove',
            module: 'FileSystem',
            reason: 'Unknown',
            cause: e,
            pathOrDescriptor: path,
          }),
      }).pipe(effect => (options?.force ? Effect.ignore(effect) : effect)),
    rename: () => Effect.die('not implemented'),
    stat: path =>
      Effect.try({
        try: () => new ExpoFileSystem.File(path),
        catch: e =>
          new SystemError({
            method: 'stat',
            module: 'FileSystem',
            reason: 'Unknown',
            cause: e,
            pathOrDescriptor: path,
          }),
      }).pipe(
        Effect.filterOrFail(
          _ => _.exists,
          () =>
            new SystemError({
              method: 'stat',
              module: 'FileSystem',
              reason: 'NotFound',
              pathOrDescriptor: path,
              description: 'No such file or read operation denied',
            }),
        ),
        Effect.map((_): FileSystem.File.Info => ({
          type: 'File',
          mtime: Option.none(),
          atime: Option.none(),
          birthtime: Option.none(),
          dev: 0,
          ino: Option.none(),
          mode: 0,
          nlink: Option.none(),
          uid: Option.none(),
          gid: Option.none(),
          rdev: Option.none(),
          size: FileSystem.Size(_.size),
          blksize: Option.none(),
          blocks: Option.none(),
        })),
        Effect.orElse(() =>
          Effect.try({
            try: () => new ExpoFileSystem.Directory(path),
            catch: e =>
              new SystemError({
                method: 'stat',
                module: 'FileSystem',
                reason: 'Unknown',
                cause: e,
                pathOrDescriptor: path,
              }),
          }).pipe(
            Effect.filterOrFail(
              _ => _.exists,
              () =>
                new SystemError({
                  method: 'stat',
                  module: 'FileSystem',
                  reason: 'NotFound',
                  pathOrDescriptor: path,
                  description: 'No such directory or access denied',
                }),
            ),
            Effect.map((_): FileSystem.File.Info => ({
              type: 'Directory',
              mtime: Option.none(),
              atime: Option.none(),
              birthtime: Option.none(),
              dev: 0,
              ino: Option.none(),
              mode: 0,
              nlink: Option.none(),
              uid: Option.none(),
              gid: Option.none(),
              rdev: Option.none(),
              size: FileSystem.Size(_.size ?? 0),
              blksize: Option.none(),
              blocks: Option.none(),
            })),
          ),
        ),
      ),
    symlink: () => Effect.die('not implemented'),
    truncate: () => Effect.die('not implemented'),
    utimes: () => Effect.die('not implemented'),
    watch: () => Effect.die('not implemented'),
    writeFile: (
      path: string,
      data: Uint8Array,
      _options?: FileSystem.WriteFileOptions,
    ) =>
      Effect.try({
        try: () => new ExpoFileSystem.File(path).write(data),
        catch: e =>
          new SystemError({
            method: 'writeFile',
            module: 'FileSystem',
            reason: 'Unknown',
            cause: e,
            pathOrDescriptor: path,
          }),
      }),
  }),
)
