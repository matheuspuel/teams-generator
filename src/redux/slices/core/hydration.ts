import { get, replace } from '@fp-ts/optic'
import { $, $f, constVoid, RT, T, TO } from 'fp'
import { defaultParameters } from 'src/datatypes/Parameters'
import { dispatch, storeGet } from 'src/redux'
import { AppStoreEnv } from 'src/redux/store'
import { GroupsStorage, ParametersStorage } from 'src/storage'
import { emptyGroups, GroupsLens } from '../groups'
import { ParametersLens } from '../parameters'

export const saveState = $(
  RT.fromReaderIO(storeGet),
  RT.chainFirstIOK($f(get(GroupsLens), GroupsStorage.set)),
  RT.chainFirstIOK($f(get(ParametersLens), ParametersStorage.set)),
)

export const hydrate = (env: AppStoreEnv) =>
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
      dispatch(
        $f(
          replace(GroupsLens)(p.groups),
          replace(ParametersLens)(p.parameters),
        ),
      )(env),
    ),
    T.map(constVoid),
  )
