import 'fast-text-encoding'

import { Effect, Layer, Runtime, pipe } from 'effect'
import { startApp } from 'src/app'
import { runtime } from './runtime'
import { UILive } from './services/UI/default'

const appLayerWithUI = Layer.succeedContext(runtime.context).pipe(
  Layer.provideMerge(UILive),
)

const runtimeWithUI = pipe(
  Layer.toRuntime(appLayerWithUI),
  Effect.scoped,
  Effect.cached,
  Effect.flatten,
  Effect.runSync,
)

// eslint-disable-next-line functional/no-expression-statements
void Runtime.runPromiseExit(runtimeWithUI)(startApp)
