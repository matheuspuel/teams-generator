import { get } from '@fp-ts/optic'
import { $, $f, constVoid, RT, RTE, S } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { root } from 'src/model/Optics'
import {
  GroupOrderRepository,
  GroupsRepository,
  ParametersRepository,
} from 'src/services/Repositories'
import { execute, getRootState, replaceSApp } from 'src/services/StateRef'
import { emptyGroups } from '../groups'

export const saveState = $(
  RT.fromReaderIO(execute(getRootState)),
  RT.chainFirstReaderIOKW($f(get(root.groups.$), GroupsRepository.set)),
  RT.chainFirstReaderIOKW($f(get(root.parameters.$), ParametersRepository.set)),
  RT.chainFirstReaderIOKW($f(get(root.groupOrder.$), GroupOrderRepository.set)),
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
  RT.apSW(
    'groupOrder',
    $(
      GroupOrderRepository.get,
      RTE.getOrElseW(() => RT.of(GroupOrder.initial)),
    ),
  ),
  RT.chainFirstReaderIOKW(p =>
    $(
      replaceSApp(root.groups.$)(p.groups),
      S.apFirst(replaceSApp(root.parameters.$)(p.parameters)),
      S.apFirst(replaceSApp(root.groupOrder.$)(p.groupOrder)),
      execute,
    ),
  ),
  RT.map(constVoid),
)
