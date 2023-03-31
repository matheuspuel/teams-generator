import { get } from '@fp-ts/optic'
import { $, $f, RT, S, T, TO, constVoid } from 'fp'
import { defaultParameters } from 'src/datatypes/Parameters'
import {
  AppStateRefEnv,
  execute,
  getRootState,
  replaceSApp,
} from 'src/services/StateRef'
import { GroupsStorage, ParametersStorage } from 'src/services/Storage'
import { GroupsLens, emptyGroups } from '../groups'
import { ParametersLens } from '../parameters'

export const saveState = $(
  RT.fromReaderIO(execute(getRootState)),
  RT.chainFirstIOK($f(get(GroupsLens), GroupsStorage.set)),
  RT.chainFirstIOK($f(get(ParametersLens), ParametersStorage.set)),
)

export const hydrate = (env: AppStateRefEnv) =>
  $(
    T.Do,
    T.apS(
      'groups',
      $(
        GroupsStorage.get,
        TO.getOrElseW(() => T.of(emptyGroups)),
      ),
    ),
    T.apS(
      'parameters',
      $(
        ParametersStorage.get,
        TO.getOrElseW(() => T.of(defaultParameters)),
      ),
    ),
    T.chainFirstIOK(p =>
      $(
        replaceSApp(GroupsLens)(p.groups),
        S.apFirst(replaceSApp(ParametersLens)(p.parameters)),
        execute,
      )(env),
    ),
    T.map(constVoid),
  )
