import { IO } from 'fp'

export type UI<R> = {
  start: (env: R) => IO<void>
}

export type UIEnv<R> = { ui: UI<R> } & R

export const UI = {
  // eslint-disable-next-line functional/prefer-tacit
  start: <R>(env: UIEnv<R>) => env.ui.start(env),
}
