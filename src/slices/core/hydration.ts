import { get } from '@fp-ts/optic'
import { $, $f, F, pipe } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { root } from 'src/model/optic'
import { Repository } from 'src/services/Repositories'
import { StateRef } from 'src/services/StateRef'
import { emptyGroups } from '../groups'

export const saveState = $(
  StateRef.get,
  F.tap($f(get(root.at('groups')), Repository.teams.groups.set)),
  F.tap($f(get(root.at('parameters')), Repository.teams.parameters.set)),
  F.tap($f(get(root.at('groupOrder')), Repository.teams.groupOrder.set)),
  F.catchAll(() => F.unit),
)

export const hydrate = $(
  F.Do,
  F.bind('groups', () =>
    $(
      Repository.teams.groups.get(),
      F.catchAll(() => F.succeed(emptyGroups)),
    ),
  ),
  F.bind('parameters', () =>
    $(
      Repository.teams.parameters.get(),
      F.catchAll(() => F.succeed(Parameters.initial)),
    ),
  ),
  F.bind('groupOrder', () =>
    $(
      Repository.teams.groupOrder.get(),
      F.catchAll(() => F.succeed(GroupOrder.initial)),
    ),
  ),
  F.tap(p =>
    pipe(
      StateRef.on(root.at('groups')).set(p.groups),
      F.tap(() => StateRef.on(root.at('parameters')).set(p.parameters)),
      F.tap(() => StateRef.on(root.at('groupOrder')).set(p.groupOrder)),
    ),
  ),
  F.asUnit,
)
