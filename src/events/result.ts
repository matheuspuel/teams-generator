import { Effect, pipe } from 'effect'
import { Player } from 'src/datatypes'
import { t } from 'src/i18n'
import { ShareService } from 'src/services/Share'
import { State, StateRef } from 'src/services/StateRef'
import { getActiveModality } from 'src/slices/groups'
import { storeUrls } from 'src/utils/Metadata'

export const shareResult = () =>
  pipe(
    Effect.all({
      result: State.with(s => s.result).pipe(Effect.flatten),
      modality: State.with(getActiveModality).pipe(Effect.flatten),
    }),
    StateRef.query,
    Effect.flatMap(({ result, modality }) =>
      pipe(
        Player.teamListToStringSensitive({ modality })(result),
        _ =>
          `${_}\n\n${t('appName')}\nAndroid: ${storeUrls.android}\niOS: ${storeUrls.ios}`,
        _ => ShareService.shareMessage({ message: _, title: t('Teams') }),
      ),
    ),
    Effect.ignore,
  )
