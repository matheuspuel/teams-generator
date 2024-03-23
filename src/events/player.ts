import { Schema } from '@effect/schema'
import { Effect, Option, String, flow, pipe } from 'effect'
import { not } from 'effect/Predicate'
import { Rating } from 'src/datatypes'
import { root } from 'src/model/optic'
import { State, StateRef } from 'src/services/StateRef'
import {
  createPlayer,
  deleteCurrentPlayer,
  editPlayer,
} from 'src/slices/groups'
import { goBack } from 'src/slices/routes'

export const changePlayerName = flow(
  State.on(root.at('playerForm').at('name')).set,
  StateRef.execute,
)

export const changePlayerPosition = flow(
  State.on(root.at('playerForm').at('positionAbbreviation')).set,
  StateRef.execute,
)

export const changePlayerRating = flow(
  (v: number) => Math.round(v * 20) / 2,
  Schema.decodeUnknownOption(Rating.Rating),
  Option.map(
    flow(State.on(root.at('playerForm').at('rating')).set, StateRef.execute),
  ),
  Option.getOrElse(() => Effect.unit),
)

export const deletePlayer = () =>
  pipe(
    State.update(deleteCurrentPlayer),
    Effect.tap(() => goBack),
    StateRef.execute,
  )

export const savePlayer = () =>
  pipe(
    Effect.all({
      form: pipe(
        State.on(root.at('playerForm')).get,
        Effect.map(v => ({ ...v, name: v.name.trim() })),
        Effect.flatMap(f =>
          pipe(f, Option.liftPredicate(not(() => String.isEmpty(f.name)))),
        ),
      ),
      groupId: Effect.flatten(
        State.on(root.at('ui').at('selectedGroupId')).get,
      ),
      playerId: State.on(root.at('ui').at('selectedPlayerId')).get,
    }),
    Effect.flatMap(({ form, groupId, playerId }) =>
      pipe(
        playerId,
        Option.match({
          onNone: () => createPlayer({ groupId, player: form }),
          onSome: id => editPlayer({ groupId, player: { ...form, id } }),
        }),
        Effect.flatMap(() => goBack),
      ),
    ),
    StateRef.execute,
    Effect.ignore,
  )
