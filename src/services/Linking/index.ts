import { Chunk, Effect, Option, Stream, pipe } from 'effect'
import * as ExpoLinking from 'expo-linking'

export class Linking extends Effect.Service<Linking>()('Linking', {
  succeed: {
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
  },
}) {
  static openURL = Effect.serviceFunctionEffect(Linking, _ => _.openURL)
  static getInitialURL = Effect.serviceFunctionEffect(
    Linking,
    _ => _.getInitialURL,
  )
  static startLinkingStream = (
    ...args: Parameters<Linking['startLinkingStream']>
  ) => Stream.flatMap(Linking, _ => _.startLinkingStream(...args))
}
