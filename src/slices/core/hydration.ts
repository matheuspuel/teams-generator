import { get } from '@fp-ts/optic'
import { $, $f, constVoid, RT, S, T, TO } from 'fp'
import { Parameters } from 'src/datatypes'
import { root } from 'src/model/Optics'
import {
  AppStateRefEnv,
  execute,
  getRootState,
  replaceSApp,
} from 'src/services/StateRef'
import { GroupsStorage, ParametersStorage } from 'src/services/Storage'
import { emptyGroups } from '../groups'
import {} from '../parameters'

export const saveState = $(
  RT.fromReaderIO(execute(getRootState)),
  RT.chainFirstIOK($f(get(root.groups.$), GroupsStorage.set)),
  RT.chainFirstIOK($f(get(root.parameters.$), ParametersStorage.set)),
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
        TO.getOrElseW(() => T.of(Parameters.initial)),
      ),
    ),
    T.chainFirstIOK(p =>
      $(
        replaceSApp(root.groups.$)(p.groups),
        S.apFirst(replaceSApp(root.parameters.$)(p.parameters)),
        execute,
      )(env),
    ),
    T.map(constVoid),
  )
