import { Context, Effect, Option, Stream } from 'effect'

export type LinkingImplementation = {
  openURL: (url: string) => Effect.Effect<void>
  getInitialURL: () => Effect.Effect<Option.Option<string>>
  startLinkingStream: () => Stream.Stream<string>
}

export class Linking extends Context.Tag('Linking')<
  Linking,
  LinkingImplementation
>() {
  static openURL = Effect.serviceFunctionEffect(Linking, s => s.openURL)
  static getInitialURL = Effect.serviceFunctionEffect(
    Linking,
    s => s.getInitialURL,
  )
  static startLinkingStream = (
    ...args: Parameters<LinkingImplementation['startLinkingStream']>
  ) => Stream.flatMap(Linking, env => env.startLinkingStream(...args))
}
