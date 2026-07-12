import { Effect, pipe, Ref } from 'effect'
import { GroupOrder } from 'src/datatypes'
import { Repository } from 'src/services/Repositories'
import { appStateMachineInstance } from 'src/state'

export const saveState = () =>
  pipe(
    appStateMachineInstance.ref,
    Ref.get,
    Effect.tap(_ => Repository.teams.Groups.set(_.groups)),
    Effect.tap(_ => Repository.teams.Parameters.set(_.parameters)),
    Effect.tap(_ => Repository.teams.Preferences.set(_.preferences)),
    Effect.tap(_ => Repository.teams.GroupOrder.set(_.groupOrder)),
    Effect.tap(_ => Repository.teams.Modality.set(_.customModalities)),
    Effect.catchAll(() => Effect.void),
  )

export const hydrate = Effect.all([
  pipe(
    Repository.teams.Groups.get(),
    Effect.tap(data => appStateMachineInstance.actions.groups.set(data)),
    Effect.ignore,
  ),
  pipe(
    Repository.teams.Parameters.get(),
    Effect.tap(data =>
      Ref.update(appStateMachineInstance.ref, _ => ({
        ..._,
        parameters: data,
      })),
    ),
    Effect.ignore,
  ),
  pipe(
    Repository.teams.Preferences.get(),
    Effect.catchAll(() => Effect.succeed({ isRatingVisible: true })),
    Effect.tap(data =>
      appStateMachineInstance.actions.preferences.isRatingVisible.set(
        data.isRatingVisible,
      ),
    ),
  ),
  pipe(
    Repository.teams.GroupOrder.get(),
    Effect.catchAll(() => Effect.succeed(GroupOrder.initial)),
    Effect.tap(data => appStateMachineInstance.actions.groupOrder.set(data)),
  ),
  pipe(
    Repository.teams.Modality.get(),
    Effect.catchAll(() => Effect.succeed([])),
    Effect.tap(data =>
      appStateMachineInstance.actions.customModalities.set(data),
    ),
  ),
]).pipe(Effect.asVoid)
