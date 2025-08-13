import { Context, Effect, Option, Stream } from 'effect'

export class Linking extends Context.Tag('Linking')<
  Linking,
  {
    openURL: (url: string) => Effect.Effect<void>
    getInitialURL: () => Effect.Effect<Option.Option<string>>
    startLinkingStream: () => Stream.Stream<string>
  }
>() {
  static openURL = Effect.serviceFunctionEffect(Linking, _ => _.openURL)
  static getInitialURL = Effect.serviceFunctionEffect(
    Linking,
    _ => _.getInitialURL,
  )
  static startLinkingStream = (
    ...args: Parameters<Linking['Type']['startLinkingStream']>
  ) => Stream.flatMap(Linking, _ => _.startLinkingStream(...args))
}
