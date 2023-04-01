import { IO, ReaderIO } from 'fp'

export type BackHandler = {
  subscribe: <R>(
    f: ReaderIO<R, { shouldBubbleUpEvent: boolean }>,
  ) => ReaderIO<R, { unsubscribe: IO<void> }>
}

export type BackHandlerEnv = { backHandler: BackHandler }

export const BackHandler = {
  subscribe:
    <R>(f: ReaderIO<R, { shouldBubbleUpEvent: boolean }>) =>
    (env: BackHandlerEnv & R) =>
      env.backHandler.subscribe(f)(env),
}
