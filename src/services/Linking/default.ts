import * as ExpoLinking from 'expo-linking'
import { Chunk, F, Layer, O, Stream, pipe } from 'fp'
import { LinkingEnv } from '.'

export const LinkingLive = LinkingEnv.context({
  openURL: url =>
    pipe(
      F.tryPromise(() => ExpoLinking.openURL(url)),
      F.ignore,
    ),
  getInitialURL: () =>
    pipe(
      F.tryPromise(() => ExpoLinking.getInitialURL()),
      F.map(O.fromNullable),
      F.orElseSucceed(() => O.none()),
    ),
  startLinkingStream: () =>
    Stream.async<never, never, string>(emit =>
      ExpoLinking.addEventListener(
        'url',
        e => void emit(F.succeed(Chunk.of(e.url))),
      ),
    ),
}).pipe(Layer.succeedContext)
