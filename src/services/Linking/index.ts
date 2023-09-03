import { serviceFunctions } from '@effect/io/Effect'
import { Context, Effect, Option, Stream } from 'fp'

export type Linking = {
  getInitialURL: () => Effect<never, never, Option<string>>
  startLinkingStream: () => Stream.Stream<never, never, string>
}

export const LinkingEnv = Context.Tag<Linking>()

const functions = serviceFunctions(LinkingEnv)

export const Linking = {
  getInitialURL: functions.getInitialURL,
  startLinkingStream: (...args: Parameters<Linking['startLinkingStream']>) =>
    Stream.flatMap(LinkingEnv, env => env.startLinkingStream(...args)),
}
