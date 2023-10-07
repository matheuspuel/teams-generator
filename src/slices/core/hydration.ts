import { get } from '@fp-ts/optic'
import { F, flow, pipe } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { root } from 'src/model/optic'
import { Repository } from 'src/services/Repositories'
import { State, StateRef } from 'src/services/StateRef'
import { emptyGroups } from '../groups'

export const saveState = () =>
  pipe(
    StateRef.query(State.get),
    F.tap(flow(get(root.at('groups')), Repository.teams.Groups.set)),
    F.tap(flow(get(root.at('parameters')), Repository.teams.Parameters.set)),
    F.tap(flow(get(root.at('groupOrder')), Repository.teams.GroupOrder.set)),
    F.catchAll(() => F.unit),
  )

export const hydrate = pipe(
  F.Do,
  F.bind('groups', () =>
    pipe(
      Repository.teams.Groups.get(),
      F.catchAll(() => F.succeed(emptyGroups)),
    ),
  ),
  F.bind('parameters', () =>
    pipe(
      Repository.teams.Parameters.get(),
      F.catchAll(() => F.succeed(Parameters.initial)),
    ),
  ),
  F.bind('groupOrder', () =>
    pipe(
      Repository.teams.GroupOrder.get(),
      F.catchAll(() => F.succeed(GroupOrder.initial)),
    ),
  ),
  F.tap(p =>
    pipe(
      State.on(root.at('groups')).set(p.groups),
      F.tap(() => State.on(root.at('parameters')).set(p.parameters)),
      F.tap(() => State.on(root.at('groupOrder')).set(p.groupOrder)),
      StateRef.execute,
    ),
  ),
  F.asUnit,
)
