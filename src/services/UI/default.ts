import { registerRootComponent } from 'expo'
import { Effect, F, Layer } from 'fp'
import { Element } from 'src/components/types'
import { runtime } from 'src/runtime'
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
    StateRef: AppStateRefEnv,
    context: F.succeed(initialUIContext),
    runtime: F.succeed(runtime),
  }),
  env =>
    UIEnv.context({
      start: () => startReactNativeUI(DefaultUIRoot(env)),
    }),
).pipe(Layer.effectContext)
