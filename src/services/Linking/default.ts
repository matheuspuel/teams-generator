import { Chunk, Effect, Layer, Option, Stream, pipe } from 'effect'
import * as ExpoLinking from 'expo-linking'
import { Linking } from '.'

export const LinkingDefault = Linking.context({
  openURL: (url: string) =>
    pipe(
      Effect.tryPromise(() => ExpoLinking.openURL(url)),
      Effect.ignore,
    ),
  getInitialURL: () =>
    pipe(
      Effect.tryPromise(() => ExpoLinking.getInitialURL()),
      Effect.map(Option.fromNullable),
      Effect.orElseSucceed(() => Option.none()),
    ),
  startLinkingStream: () =>
    Stream.async<string>(
      emit =>
        void ExpoLinking.addEventListener(
          'url',
          e => void emit(Effect.succeed(Chunk.of(e.url))),
        ),
    ),
}).pipe(Layer.succeedContext)
