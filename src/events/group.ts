import { Effect, Option, pipe } from 'effect'
import { Parameters as Parameters_ } from 'src/datatypes'
import { exportGroup as exportGroup_ } from 'src/export/group'
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
import {
  eraseResult,
  generateResult as generateResult_,
} from 'src/slices/result'
import { Route, goBack, navigate } from 'src/slices/routes'
import { Id } from 'src/utils/Entity'

export const openGroupMenu = StateRef.execute(navigate(Route.GroupMenu()))

export const openGroupSort = pipe(
  goBack,
  Effect.tap(navigate(Route.SortGroup())),
  StateRef.execute,
)

export const sortPlayersBy = {
  name: StateRef.execute(onSelectGroupOrder('name')),
  position: StateRef.execute(onSelectGroupOrder('position')),
  rating: StateRef.execute(onSelectGroupOrder('rating')),
  active: StateRef.execute(onSelectGroupOrder('active')),
  date: StateRef.execute(onSelectGroupOrder('date')),
}

export const openParameters = StateRef.execute(navigate(Route.Parameters()))

export const decrementTeamsCount = StateRef.execute(decrementTeamsCount_)

export const incrementTeamsCount = StateRef.execute(incrementTeamsCount_)

export const toggleTeamsCountType = StateRef.execute(
  State.on(root.at('parameters')).update(Parameters_.toggleType),
)

export const togglePositionParameter = StateRef.execute(togglePosition)

export const toggleRatingParameter = StateRef.execute(toggleRating)

export const generateResult = pipe(
  Effect.all([eraseResult, goBack, navigate(Route.Result())]),
  StateRef.execute,
  Effect.tap(() => Effect.sleep(0)),
  Effect.flatMap(() => generateResult_),
).pipe(Effect.ignore)

export const exportGroup = pipe(
  goBack,
  StateRef.execute,
  Effect.tap(() => exportGroup_()),
  Effect.ignore,
)

export const openDeleteGroup = StateRef.execute(
  Effect.all([goBack, navigate(Route.DeleteGroup())]),
)

export const deleteGroup = pipe(
  State.with(getSelectedGroup),
  Effect.flatten,
  Effect.flatMap(({ id }) => deleteGroup_({ id })),
  Effect.tap(goBack),
  Effect.tap(goBack),
  Effect.tap(goBack),
  StateRef.execute,
  Effect.ignore,
)

export const startNewPlayer = pipe(
  navigate(Route.Player()),
  Effect.tap(() =>
    State.on(root.at('ui').at('selectedPlayerId')).set(Option.none()),
  ),
  Effect.flatMap(() => State.with(getActiveModality).pipe(Effect.flatten)),
  Effect.tap(m =>
    State.on(root.at('playerForm')).set(blankPlayerForm({ modality: m })),
  ),
  StateRef.execute,
).pipe(Effect.ignore)

export const openPlayer = (playerId: Id) =>
  pipe(
    navigate(Route.Player()),
    Effect.flatMap(() =>
      State.with(getPlayerFromSelectedGroup({ playerId })).pipe(Effect.flatten),
    ),
    Effect.flatMap(v =>
      pipe(
        State.on(root.at('playerForm')).set(getPlayerFormFromData(v)),
        Effect.tap(() =>
          State.on(root.at('ui').at('selectedPlayerId')).set(
            Option.some(playerId),
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
  Effect.tap(goBack),
  StateRef.execute,
)
