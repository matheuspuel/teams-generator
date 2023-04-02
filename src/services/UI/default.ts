import { registerRootComponent } from 'expo'
import { Reader, ReaderIO } from 'fp'
import { Element } from 'src/components/custom/types'
import { UIRoot } from 'src/views'
import { UI } from '.'

const startReactNativeUI =
  <R>(rootComponent: Reader<R, Element>): ReaderIO<R, void> =>
  env =>
  () =>
    registerRootComponent(() => rootComponent(env))

const inferUIEnv = <R>(ui: UI<R>): UI<R> => ui

export const defaultUI = inferUIEnv({
  start: startReactNativeUI(UIRoot),
})
