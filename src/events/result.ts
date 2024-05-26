import { Effect, pipe } from 'effect'
import { Player } from 'src/datatypes'
import { t } from 'src/i18n'
import { root } from 'src/model/optic'
import { ShareService } from 'src/services/Share'
import { State, StateRef } from 'src/services/StateRef'
import { getActiveModality } from 'src/slices/groups'
import { toggle } from 'src/utils/fp/Boolean'

export const toggleRatingVisibility = State.on(
  root.at('preferences').at('isRatingVisible'),
)
  .update(toggle)
  .pipe(StateRef.execute)

export const shareResult = pipe(
  Effect.all({
    result: State.flatWith(s => s.result),
    modality: State.flatWith(getActiveModality),
  }),
  StateRef.query,
  Effect.flatMap(({ result, modality }) =>
    pipe(
      Player.teamListToStringSensitive({ modality })(result),
      // _ =>
      //   `${_}\n\n${t('appName')}\nAndroid: ${storeUrls.android}\niOS: ${storeUrls.ios}`,
      _ => ShareService.shareMessage({ message: _, title: t('Teams') }),
    ),
  ),
  Effect.ignore,
)
