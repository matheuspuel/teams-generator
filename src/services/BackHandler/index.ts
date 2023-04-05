import { IO, ReaderIO } from 'fp'

export type BackHandler = {
  exit: IO<void>
  subscribe: <R>(f: ReaderIO<R, void>) => ReaderIO<R, { unsubscribe: IO<void> }>
}

export type BackHandlerEnv = { backHandler: BackHandler }

export const BackHandler = {
  exit: (env: BackHandlerEnv) => env.backHandler.exit,
  subscribe:
    <R>(f: ReaderIO<R, void>) =>
    (env: BackHandlerEnv & R) =>
      env.backHandler.subscribe(f)(env),
}
