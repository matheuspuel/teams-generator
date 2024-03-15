import { registerRootComponent } from 'expo'
import { Effect, F, Layer } from 'fp'
import { Element } from 'src/components/types'
import { UIEnv } from '.'
import { DefaultUIRoot } from './defaultRoot'

const startReactNativeUI = (rootComponent: () => Element): Effect<void> =>
  F.sync(() => registerRootComponent(rootComponent))

export const UILive = UIEnv.context({
  start: () => startReactNativeUI(DefaultUIRoot),
}).pipe(Layer.succeedContext)
