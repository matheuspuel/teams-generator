import { Effect, pipe } from 'effect'
import { root } from 'src/model/optic'
import { Alert } from 'src/services/Alert'
import { BackHandler } from 'src/services/BackHandler'
import { SplashScreen } from 'src/services/SplashScreen'
import { State, StateRef } from 'src/services/StateRef'
import { goBack } from 'src/slices/routes'

export const appLoaded = () =>
  StateRef.execute(State.on(root.at('core').at('isLoaded')).set(true))

export const hideSplashScreen = () => SplashScreen.hide()

export const back = () =>
  pipe(
    goBack,
    StateRef.execute,
    Effect.tap(({ isHandled }) =>
      isHandled ? Effect.unit : BackHandler.exit(),
    ),
  )

export const dismissAlert = () => Alert.dismiss()
