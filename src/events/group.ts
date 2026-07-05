import { Effect, Fiber, Option, pipe } from 'effect'
import { router } from 'expo-router'
import { Parameters as Parameters_ } from 'src/datatypes'
import { root } from 'src/model/optic'
import { State, StateRef } from 'src/services/StateRef'
import { onSelectGroupOrder } from 'src/slices/groupOrder'
import {
  deleteGroup as deleteGroup_,
  getActiveModality,
  getPlayerFromSelectedGroup,
  getSelectedGroup,
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

export const generateResult = Effect.gen(function* () {
  yield* interruptResultGeneration
  yield* Effect.gen(function* () {
    yield* State.on(root.at('result')).set(Fiber.never)
    const groupId = yield* yield* State.on(root.at('ui').at('selectedGroupId'))
      .get
    yield* Effect.sync(() => router.back())
    yield* Effect.sync(() => router.navigate(`/groups/${groupId}/result`))
  }).pipe(StateRef.execute)
  yield* Effect.sleep(100)
  yield* generateResult_
}).pipe(Effect.ignore)

export const openDeleteGroup = Effect.gen(function* () {
  const group = yield* State.flatWith(getSelectedGroup).pipe(StateRef.execute)
  router.navigate(`/groups/${group.id}/delete`)
}).pipe(Effect.ignore)

export const deleteGroup = pipe(
  State.with(getSelectedGroup),
  Effect.flatten,
  Effect.flatMap(({ id }) => deleteGroup_({ id })),
  Effect.tap(() => Effect.sync(() => router.back())),
  Effect.tap(() => Effect.sync(() => router.back())),
  Effect.tap(() => Effect.sync(() => router.back())),
  StateRef.execute,
  Effect.ignore,
)

export const startNewPlayer = (args: { group: { id: Id } }) =>
  pipe(
    Effect.sync(() =>
      router.navigate(`/groups/${args.group.id}/players/create`),
    ),
    Effect.tap(() =>
      State.on(root.at('ui').at('selectedPlayerId')).set(Option.none()),
    ),
    Effect.flatMap(() => State.flatWith(getActiveModality)),
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
    Effect.flatMap(() =>
      State.flatWith(getPlayerFromSelectedGroup({ playerId: args.player.id })),
    ),
    Effect.flatMap(v =>
      pipe(
        State.on(root.at('playerForm')).set(getPlayerFormFromData(v)),
        Effect.tap(() =>
          State.on(root.at('ui').at('selectedPlayerId')).set(
            Option.some(args.player.id),
          ),
        ),
      ),
    ),
    StateRef.execute,
    Effect.ignore,
  )

export const togglePlayerActive = (id: Id) =>
  StateRef.execute(togglePlayerActive_({ playerId: id }))

export const toggleAllPlayers = pipe(
  State.update(toggleAllPlayersActive),
  StateRef.execute,
)
