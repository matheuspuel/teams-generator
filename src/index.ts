import { F, Layer, Runtime, pipe } from 'fp'
import { startApp } from 'src/app'
import { runtime } from './runtime'
import { UILive } from './services/UI/default'

const appLayerWithUI = Layer.succeedContext(runtime.context).pipe(
  Layer.provideMerge(UILive),
)

const runtimeWithUI = pipe(
  Layer.toRuntime(appLayerWithUI),
  F.scoped,
  F.cached,
  F.flatten,
  F.runSync,
)

// eslint-disable-next-line functional/no-expression-statements
void Runtime.runPromiseExit(runtimeWithUI)(startApp)
