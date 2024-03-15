import { serviceFunctions } from 'effect/Effect'
import { Context, Effect, Option, Stream } from 'fp'

export type Linking = {
  openURL: (url: string) => Effect<void>
  getInitialURL: () => Effect<Option<string>>
  startLinkingStream: () => Stream.Stream<string>
}

export class LinkingEnv extends Context.Tag('Linking')<LinkingEnv, Linking>() {}

const functions = serviceFunctions(LinkingEnv)

export const Linking = {
  openURL: functions.openURL,
  getInitialURL: functions.getInitialURL,
  startLinkingStream: (...args: Parameters<Linking['startLinkingStream']>) =>
    Stream.flatMap(LinkingEnv, env => env.startLinkingStream(...args)),
}
