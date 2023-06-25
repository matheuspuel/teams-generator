import { registerRootComponent } from 'expo'
import { Eff, Effect } from 'fp'
import { Element } from 'src/components/types'
import { UI } from '.'
import { DefaultUIRequirements, DefaultUIRoot } from './defaultRoot'

const startReactNativeUI = (rootElement: Element): Effect<never, never, void> =>
  Eff.sync(() => registerRootComponent(() => rootElement))

export const defaultUI = (env: DefaultUIRequirements): UI => ({
  start: startReactNativeUI(DefaultUIRoot(env)),
})
