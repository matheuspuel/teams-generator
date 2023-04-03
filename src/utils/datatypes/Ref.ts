import { IO } from '../fp'

export type Ref<A> = {
  getState: IO<A>
  setState: (nextState: A) => IO<void>
}

export const create = <A>(initialState: A): Ref<A> => {
  // eslint-disable-next-line functional/no-let
  let state: A = initialState
  return {
    getState: () => state,
    setState: (nextState: A) => () => {
      // eslint-disable-next-line functional/no-expression-statements
      state = nextState
    },
  }
}
