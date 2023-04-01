import { get } from '@fp-ts/optic'
import { $, $f, constVoid, RT, RTE, S } from 'fp'
import { Parameters } from 'src/datatypes'
import { root } from 'src/model/Optics'
import {
  GroupsRepository,
  ParametersRepository,
} from 'src/services/Repositories'
import { execute, getRootState, replaceSApp } from 'src/services/StateRef'
import { emptyGroups } from '../groups'
import {} from '../parameters'

export const saveState = $(
  RT.fromReaderIO(execute(getRootState)),
  RT.chainFirstReaderIOKW($f(get(root.groups.$), GroupsRepository.set)),
  RT.chainFirstReaderIOKW($f(get(root.parameters.$), ParametersRepository.set)),
)

export const hydrate = $(
  RT.Do,
  RT.apSW(
    'groups',
    $(
      GroupsRepository.get,
      RTE.getOrElseW(() => RT.of(emptyGroups)),
    ),
  ),
  RT.apSW(
    'parameters',
    $(
      ParametersRepository.get,
      RTE.getOrElseW(() => RT.of(Parameters.initial)),
    ),
  ),
  RT.chainFirstReaderIOKW(p =>
    $(
      replaceSApp(root.groups.$)(p.groups),
      S.apFirst(replaceSApp(root.parameters.$)(p.parameters)),
      execute,
    ),
  ),
  RT.map(constVoid),
)
