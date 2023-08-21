import { get } from '@fp-ts/optic'
import { $, $f, F, S } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { root } from 'src/model/Optics'
import { Repository } from 'src/services/Repositories'
import { execute, getRootState, replaceSApp } from 'src/services/StateRef'
import { emptyGroups } from '../groups'

export const saveState = $(
  execute(getRootState),
  F.tap($f(get(root.groups.$), Repository.teams.groups.set)),
  F.tap($f(get(root.parameters.$), Repository.teams.parameters.set)),
  F.tap($f(get(root.groupOrder.$), Repository.teams.groupOrder.set)),
  F.catchAll(() => F.unit),
)

export const hydrate = $(
  F.Do,
  F.bind('groups', () =>
    $(
      Repository.teams.groups.get,
      F.catchAll(() => F.succeed(emptyGroups)),
    ),
  ),
  F.bind('parameters', () =>
    $(
      Repository.teams.parameters.get,
      F.catchAll(() => F.succeed(Parameters.initial)),
    ),
  ),
  F.bind('groupOrder', () =>
    $(
      Repository.teams.groupOrder.get,
      F.catchAll(() => F.succeed(GroupOrder.initial)),
    ),
  ),
  F.tap(p =>
    $(
      replaceSApp(root.groups.$)(p.groups),
      S.apFirst(replaceSApp(root.parameters.$)(p.parameters)),
      S.apFirst(replaceSApp(root.groupOrder.$)(p.groupOrder)),
      execute,
    ),
  ),
  F.asUnit,
)
