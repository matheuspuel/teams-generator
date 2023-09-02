import { Context, Effect, F, Option, Stream } from 'fp'

export type Linking = {
  getInitialURL: () => Effect<never, never, Option<string>>
  startLinkingStream: () => Stream.Stream<never, never, string>
}

export const LinkingEnv = Context.Tag<Linking>()

export const Linking = {
  getInitialURL: (...args: Parameters<Linking['getInitialURL']>) =>
    F.flatMap(LinkingEnv, env => env.getInitialURL(...args)),
  startLinkingStream: (...args: Parameters<Linking['startLinkingStream']>) =>
    Stream.flatMap(LinkingEnv, env => env.startLinkingStream(...args)),
}
