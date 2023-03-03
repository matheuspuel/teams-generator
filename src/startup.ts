import { $, RT } from 'fp'
import throttle from 'lodash.throttle'
import { hydrate, saveState } from 'src/redux/slices/core/hydration'
import { milliseconds } from 'src/utils/Duration'
import { replace } from 'src/utils/Optic'
import { dispatch } from './redux'
import { LoadedLens } from './redux/slices/core/loading'
import { AppStoreEnv } from './redux/store'

export const runStartupTasks = $(
  $(
    hydrate,
    RT.chainFirstReaderIOKW(
      () => (env: AppStoreEnv) => () =>
        env.store.subscribe(
          throttle(() => void saveState(env)(), $(1000, milliseconds)),
        ),
    ),
  ),
  RT.chainFirstReaderIOKW(() => dispatch(replace(LoadedLens)(true))),
)
