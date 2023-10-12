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
    F.tap(flow(get(root.at('modalities')), Repository.teams.Modality.set)),
    F.catchAll(() => F.unit),
  )

export const hydrate = F.all([
  pipe(
    Repository.teams.Groups.get(),
    F.catchAll(() => F.succeed(emptyGroups)),
    F.flatMap(data => StateRef.execute(State.on(root.at('groups')).set(data))),
  ),
  pipe(
    Repository.teams.Parameters.get(),
    F.catchAll(() => F.succeed(Parameters.initial)),
    F.flatMap(data =>
      StateRef.execute(State.on(root.at('parameters')).set(data)),
    ),
  ),
  pipe(
    Repository.teams.GroupOrder.get(),
    F.catchAll(() => F.succeed(GroupOrder.initial)),
    F.flatMap(data =>
      StateRef.execute(State.on(root.at('groupOrder')).set(data)),
    ),
  ),
  pipe(
    Repository.teams.Modality.get(),
    F.catchAll(() => F.succeed([])),
    F.flatMap(data =>
      StateRef.execute(State.on(root.at('modalities')).set(data)),
    ),
  ),
]).pipe(F.asUnit)
