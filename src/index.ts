import 'fast-text-encoding'

import { Effect, Layer, Runtime, pipe } from 'effect'
import { startApp } from 'src/app'
import { runtime } from './runtime'
import { UI } from './services/UI'

const appLayerWithUI = Layer.succeedContext(runtime.context).pipe(
  Layer.provideMerge(UI.Default),
)

const runtimeWithUI = pipe(
  Layer.toRuntime(appLayerWithUI),
  Effect.scoped,
  Effect.cached,
  Effect.flatten,
  Effect.runSync,
)

void Runtime.runPromiseExit(runtimeWithUI)(startApp)
