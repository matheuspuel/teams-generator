import { serviceFunctions } from 'effect/Effect'
import { Context, Effect, Option, Stream } from 'fp'

export type Linking = {
  openURL: (url: string) => Effect<never, never, void>
  getInitialURL: () => Effect<never, never, Option<string>>
  startLinkingStream: () => Stream.Stream<never, never, string>
}

export const LinkingEnv = Context.Tag<Linking>()

const functions = serviceFunctions(LinkingEnv)

export const Linking = {
  openURL: functions.openURL,
  getInitialURL: functions.getInitialURL,
  startLinkingStream: (...args: Parameters<Linking['startLinkingStream']>) =>
    Stream.flatMap(LinkingEnv, env => env.startLinkingStream(...args)),
}
