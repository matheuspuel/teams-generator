import { Eff, Effect } from '../fp'

export type Ref<A> = {
  getState: Effect<never, never, A>
  setState: (nextState: A) => Effect<never, never, void>
}

export const create = <A>(initialState: A): Ref<A> => {
  // eslint-disable-next-line functional/no-let
  let state: A = initialState
  return {
    getState: Eff.sync(() => state),
    setState: (nextState: A) =>
      Eff.sync(() => {
        // eslint-disable-next-line functional/no-expression-statements
        state = nextState
      }),
  }
}
