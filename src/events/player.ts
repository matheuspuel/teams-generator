import * as Optic from '@fp-ts/optic'
import { Array, Effect, Option, Schema, String, flow, pipe } from 'effect'
import { not } from 'effect/Predicate'
import { router } from 'expo-router'
import { Rating } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { State, StateRef } from 'src/services/StateRef'
import { createPlayer, editPlayer } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

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
  Option.getOrElse(() => Effect.void),
)

export const deletePlayer = (args: { group: { id: Id }; player: { id: Id } }) =>
  StateRef.execute(
    State.update((s: RootState) =>
      Optic.modify(root.at('groups').key(args.group.id).at('players'))(
        Array.filter(p => p.id !== args.player.id),
      )(s),
    ),
  )

export const savePlayer = (args: {
  player: { id: Id } | null
  group: { id: Id }
}) =>
  pipe(
    State.on(root.at('playerForm')).get,
    Effect.map(v => ({ ...v, name: v.name.trim() })),
    Effect.flatMap(f =>
      pipe(f, Option.liftPredicate(not(() => String.isEmpty(f.name)))),
    ),
    Effect.flatMap(form =>
      args.player?.id
        ? editPlayer({
            group: args.group,
            player: { ...form, id: args.player.id },
          })
        : createPlayer({ group: args.group, player: form }),
    ),
    StateRef.execute,
    Effect.tap(() => router.back()),
    Effect.ignore,
  )
