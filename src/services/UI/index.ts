import { IO } from 'fp'

export type UI<R> = {
  start: (env: R) => IO<void>
}

export type UIEnv<R> = { ui: UI<R> } & R

export const UI = {
  start: <R>(env: UIEnv<R>) => env.ui.start(env),
}
