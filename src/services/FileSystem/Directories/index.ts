import { Effect, Layer } from 'effect'

export class FileSystemDirectories extends Effect.Tag('FileSystemDirectories')<
  FileSystemDirectories,
  {
    document: string
    cache: string
  }
>() {
  static Test = Layer.succeed(FileSystemDirectories, {
    document: '/document',
    cache: '/cache',
  })
}
