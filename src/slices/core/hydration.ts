import { get } from '@fp-ts/optic'
import { $, $f, Eff, S } from 'fp'
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
  execute(getRootState),
  Eff.tap($f(get(root.groups.$), GroupsRepository.set)),
  Eff.tap($f(get(root.parameters.$), ParametersRepository.set)),
  Eff.tap($f(get(root.groupOrder.$), GroupOrderRepository.set)),
  Eff.catchAll(() => Eff.unit()),
)

export const hydrate = $(
  Eff.Do(),
  Eff.bindDiscard(
    'groups',
    $(
      GroupsRepository.get,
      Eff.catchAll(() => Eff.succeed(emptyGroups)),
    ),
  ),
  Eff.bindDiscard(
    'parameters',
    $(
      ParametersRepository.get,
      Eff.catchAll(() => Eff.succeed(Parameters.initial)),
    ),
  ),
  Eff.bindDiscard(
    'groupOrder',
    $(
      GroupOrderRepository.get,
      Eff.catchAll(() => Eff.succeed(GroupOrder.initial)),
    ),
  ),
  Eff.tap(p =>
    $(
      replaceSApp(root.groups.$)(p.groups),
      S.apFirst(replaceSApp(root.parameters.$)(p.parameters)),
      S.apFirst(replaceSApp(root.groupOrder.$)(p.groupOrder)),
      execute,
    ),
  ),
  Eff.asUnit,
)
