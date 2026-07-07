import { Effect, Fiber, pipe } from 'effect'
import { router } from 'expo-router'
import { Parameters as Parameters_ } from 'src/datatypes'
import { root } from 'src/model/optic'
import { State, StateRef } from 'src/services/StateRef'
import { onSelectGroupOrder } from 'src/slices/groupOrder'
import {
  deleteGroup as deleteGroup_,
  getGroupModality,
  getPlayer,
  toggleAllPlayersActive,
  togglePlayerActive as togglePlayerActive_,
} from 'src/slices/groups'
import {
  decrementTeamsCount as decrementTeamsCount_,
  incrementTeamsCount as incrementTeamsCount_,
  togglePosition,
  toggleRating,
} from 'src/slices/parameters'
import { blankPlayerForm, getPlayerFormFromData } from 'src/slices/playerForm'
import { generateResult as generateResult_ } from 'src/slices/result'
import { Id } from 'src/utils/Entity'

export const openGroupMenu = (group: { id: Id }) =>
  Effect.sync(() => router.navigate(`/groups/${group.id}/menu`))

export const sortPlayersBy = {
  name: StateRef.execute(onSelectGroupOrder('name')),
  position: StateRef.execute(onSelectGroupOrder('position')),
  rating: StateRef.execute(onSelectGroupOrder('rating')),
  active: StateRef.execute(onSelectGroupOrder('active')),
  date: StateRef.execute(onSelectGroupOrder('date')),
}

export const openParameters = Effect.sync(() => router.navigate(`/parameters`))

export const decrementTeamsCount = StateRef.execute(decrementTeamsCount_)

export const incrementTeamsCount = StateRef.execute(incrementTeamsCount_)

export const toggleTeamsCountType = StateRef.execute(
  State.on(root.at('parameters')).update(Parameters_.toggleType),
)

export const togglePositionParameter = StateRef.execute(togglePosition)

export const toggleRatingParameter = StateRef.execute(toggleRating)

export const interruptResultGeneration = Effect.gen(function* () {
  yield* (yield* StateRef.get).result.pipe(Fiber.interruptFork)
})

export const generateResult = (args: { group: { id: Id } }) =>
  Effect.gen(function* () {
    yield* interruptResultGeneration
    yield* Effect.gen(function* () {
      yield* State.on(root.at('result')).set(Fiber.never)
      yield* Effect.sync(() => router.back())
      yield* Effect.sync(() =>
        router.navigate(`/groups/${args.group.id}/result`),
      )
    }).pipe(StateRef.execute)
    yield* Effect.sleep(100)
    yield* generateResult_(args)
  }).pipe(Effect.ignore)

export const deleteGroup = (group: { id: Id }) =>
  pipe(
    deleteGroup_(group),
    StateRef.execute,
    Effect.tap(() => Effect.sync(() => router.back())),
    Effect.tap(() => Effect.sync(() => router.back())),
    Effect.tap(() => Effect.sync(() => router.back())),
    Effect.ignore,
  )

export const startNewPlayer = (args: { group: { id: Id } }) =>
  pipe(
    Effect.sync(() =>
      router.navigate(`/groups/${args.group.id}/players/create`),
    ),
    Effect.flatMap(() => State.flatWith(getGroupModality(args))),
    Effect.tap(m =>
      State.on(root.at('playerForm')).set(blankPlayerForm({ modality: m })),
    ),
    StateRef.execute,
  ).pipe(Effect.ignore)

export const openPlayer = (args: { group: { id: Id }; player: { id: Id } }) =>
  pipe(
    Effect.sync(() =>
      router.navigate(`/groups/${args.group.id}/players/${args.player.id}`),
    ),
    Effect.flatMap(() => State.flatWith(getPlayer(args))),
    Effect.flatMap(v =>
      State.on(root.at('playerForm')).set(getPlayerFormFromData(v)),
    ),
    StateRef.execute,
    Effect.ignore,
  )

export const togglePlayerActive = (args: {
  group: { id: Id }
  player: { id: Id }
}) => StateRef.execute(togglePlayerActive_(args))

export const toggleAllPlayers = (args: { group: { id: Id } }) =>
  pipe(State.update(toggleAllPlayersActive(args)), StateRef.execute)
