import { registerRootComponent } from 'expo'
import { Effect, F, Layer } from 'fp'
import { Element } from 'src/components/types'
import { AppEventHandlerEnv } from 'src/services/EventHandler'
import { UIEnv } from '.'
import { SafeAreaServiceEnv } from '../SafeArea'
import { AppStateRefEnv } from '../StateRef'
import { AppThemeEnv } from '../Theme'
import { initialUIContext } from './context'
import { DefaultUIRoot } from './defaultRoot'

const startReactNativeUI = (rootElement: Element): Effect<never, never, void> =>
  F.sync(() => registerRootComponent(() => rootElement))

export const UILive = F.map(
  F.all({
    Theme: AppThemeEnv,
    SafeArea: SafeAreaServiceEnv,
    EventHandler: AppEventHandlerEnv,
    StateRef: AppStateRefEnv,
    context: F.succeed(initialUIContext),
  }),
  env =>
    UIEnv.context({
      start: () => startReactNativeUI(DefaultUIRoot(env)),
    }),
).pipe(Layer.effectContext)
