import { Effect } from 'effect'
import { registerRootComponent } from 'expo'
import { Element } from 'src/components/types'
import { DefaultUIRoot } from './defaultRoot'

export class UI extends Effect.Service<UI>()('UI', {
  accessors: true,
  succeed: {
    start: () => startReactNativeUI(DefaultUIRoot),
  },
}) {}

const startReactNativeUI = (
  rootComponent: () => Element,
): Effect.Effect<void> =>
  Effect.sync(() => registerRootComponent(rootComponent))
