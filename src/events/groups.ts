import { Array, Effect, Option, String, flow, pipe } from 'effect'
import { not } from 'effect/Predicate'
import { router } from 'expo-router'
import { soccer } from 'src/datatypes/Modality'
import { root } from 'src/model/optic'
import { State, StateRef } from 'src/services/StateRef'
import { createGroup, editGroup, getGroup } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

export const startCreateGroup = pipe(
  State.with(s =>
    Array.head(s.customModalities).pipe(Option.getOrElse(() => soccer)),
  ),
  Effect.flatMap(m =>
    State.on(root.at('groupForm')).set({
      id: Option.none(),
      name: '',
      modality: m,
    }),
  ),
  Effect.tap(() => router.navigate(`/groups/create`)),
  StateRef.execute,
)

export const startEditGroup = (group: { id: Id }) =>
  pipe(
    State.with(getGroup(group)),
    Effect.flatten,
    Effect.tap(g =>
      State.on(root.at('groupForm')).set({
        id: Option.some(g.id),
        name: g.name,
        modality: g.modality,
      }),
    ),
    Effect.tap(_ => Effect.sync(() => router.navigate(`/groups/${_.id}/edit`))),
    StateRef.execute,
    Effect.ignore,
  )

export const changeGroupName = flow(
  State.on(root.at('groupForm').at('name')).set,
  StateRef.execute,
)

export const changeGroupModality = flow(
  State.on(root.at('groupForm').at('modality')).set,
  StateRef.execute,
)

export const saveGroup = pipe(
  State.with(s => s.groupForm),
  Effect.map(v => ({ ...v, name: v.name.trim() })),
  Effect.filterOrElse(
    f => not(String.isEmpty)(f.name),
    () => Option.none(),
  ),
  Effect.flatMap(g =>
    Option.match(g.id, {
      onNone: () => createGroup(g),
      onSome: id => editGroup({ ...g, id }),
    }),
  ),
  Effect.tap(() => Effect.sync(() => router.back())),
  StateRef.execute,
  Effect.ignore,
)
