import { root } from 'src/model/optic'
import { Alert } from 'src/services/Alert'
import { SplashScreen } from 'src/services/SplashScreen'
import { State, StateRef } from 'src/services/StateRef'

export const appLoaded = StateRef.execute(
  State.on(root.at('core').at('isLoaded')).set(true),
)

export const hideSplashScreen = SplashScreen.hide()

export const dismissAlert = Alert.dismiss()
