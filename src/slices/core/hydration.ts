import { get } from '@fp-ts/optic'
import { Effect, flow, pipe } from 'effect'
import { GroupOrder, Parameters } from 'src/datatypes'
import { root } from 'src/model/optic'
import { Repository } from 'src/services/Repositories'
import { State, StateRef } from 'src/services/StateRef'
import { emptyGroups } from '../groups'

export const saveState = () =>
  pipe(
    StateRef.query(State.get),
    Effect.tap(flow(get(root.at('groups')), Repository.teams.Groups.set)),
    Effect.tap(
      flow(get(root.at('parameters')), Repository.teams.Parameters.set),
    ),
    Effect.tap(
      flow(get(root.at('preferences')), Repository.teams.Preferences.set),
    ),
    Effect.tap(
      flow(get(root.at('groupOrder')), Repository.teams.GroupOrder.set),
    ),
    Effect.tap(
      flow(get(root.at('customModalities')), Repository.teams.Modality.set),
    ),
    Effect.catchAll(() => Effect.void),
  )

export const hydrate = Effect.all([
  pipe(
    Repository.teams.Groups.get(),
    Effect.catchAll(() => Effect.succeed(emptyGroups)),
    Effect.flatMap(data =>
      StateRef.execute(State.on(root.at('groups')).set(data)),
    ),
  ),
  pipe(
    Repository.teams.Parameters.get(),
    Effect.catchAll(() => Effect.succeed(Parameters.initial)),
    Effect.flatMap(data =>
      StateRef.execute(State.on(root.at('parameters')).set(data)),
    ),
  ),
  pipe(
    Repository.teams.Preferences.get(),
    Effect.catchAll(() => Effect.succeed({ isRatingVisible: true })),
    Effect.flatMap(data =>
      StateRef.execute(State.on(root.at('preferences')).set(data)),
    ),
  ),
  pipe(
    Repository.teams.GroupOrder.get(),
    Effect.catchAll(() => Effect.succeed(GroupOrder.initial)),
    Effect.flatMap(data =>
      StateRef.execute(State.on(root.at('groupOrder')).set(data)),
    ),
  ),
  pipe(
    Repository.teams.Modality.get(),
    Effect.catchAll(() => Effect.succeed([])),
    Effect.flatMap(data =>
      StateRef.execute(State.on(root.at('customModalities')).set(data)),
    ),
  ),
]).pipe(Effect.asVoid)
