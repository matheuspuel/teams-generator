import { Effect, pipe } from 'effect'
import { root } from 'src/model/optic'
import { BackHandler } from 'src/services/BackHandler'
import { State, StateRef } from 'src/services/StateRef'
import { goBack } from 'src/slices/routes'

export const appLoaded = () =>
  StateRef.execute(State.on(root.at('core').at('isLoaded')).set(true))

export const back = () =>
  pipe(
    goBack,
    StateRef.execute,
    Effect.tap(({ isHandled }) =>
      isHandled ? Effect.unit : BackHandler.exit(),
    ),
  )
