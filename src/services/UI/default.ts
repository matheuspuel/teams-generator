import { Effect, Layer } from 'effect'
import { registerRootComponent } from 'expo'
import { Element } from 'src/components/types'
import { UI } from '.'
import { DefaultUIRoot } from './defaultRoot'

const startReactNativeUI = (
  rootComponent: () => Element,
): Effect.Effect<void> =>
  Effect.sync(() => registerRootComponent(rootComponent))

export const UILive = UI.context({
  start: () => startReactNativeUI(DefaultUIRoot),
}).pipe(Layer.succeedContext)
