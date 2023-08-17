import { get } from '@fp-ts/optic'
import { $, $f, Eff, S } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { root } from 'src/model/Optics'
import { Repository } from 'src/services/Repositories'
import { execute, getRootState, replaceSApp } from 'src/services/StateRef'
import { emptyGroups } from '../groups'

export const saveState = $(
  execute(getRootState),
  Eff.tap($f(get(root.groups.$), Repository.teams.groups.set)),
  Eff.tap($f(get(root.parameters.$), Repository.teams.parameters.set)),
  Eff.tap($f(get(root.groupOrder.$), Repository.teams.groupOrder.set)),
  Eff.catchAll(() => Eff.unit),
)

export const hydrate = $(
  Eff.Do,
  Eff.bind('groups', () =>
    $(
      Repository.teams.groups.get,
      Eff.catchAll(() => Eff.succeed(emptyGroups)),
    ),
  ),
  Eff.bind('parameters', () =>
    $(
      Repository.teams.parameters.get,
      Eff.catchAll(() => Eff.succeed(Parameters.initial)),
    ),
  ),
  Eff.bind('groupOrder', () =>
    $(
      Repository.teams.groupOrder.get,
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
