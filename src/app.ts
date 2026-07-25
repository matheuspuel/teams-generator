import { Duration, Effect, Match, Stream, SubscriptionRef, pipe } from 'effect'
import { hydrate, saveState } from 'src/slices/core/hydration'
import { setupReceiveURLHandler } from './export/group'
import { t } from './i18n'
import { Alert } from './services/Alert'
import { runMigrations } from './services/Repositories/migrations'
import { SplashScreen } from './services/SplashScreen'
import { type RootState, appStateMachineInstance } from './state'
import { setAppLoaded } from './state/appLoading'

export const startApp = Effect.gen(function* () {
  yield* SplashScreen.preventAutoHide()
  yield* runMigrations.pipe(Effect.ignore)
  yield* hydrate
  const updatesRef = yield* SubscriptionRef.make<RootState | null>(null)
  yield* appStateMachineInstance.subscribe(_ =>
    SubscriptionRef.set(updatesRef, _),
  )
  yield* pipe(
    updatesRef.changes,
    Stream.debounce(Duration.decode('1000 millis')),
    Stream.changes,
    Stream.flatMap(() => saveState()),
    Stream.runDrain,
    Effect.forkDaemon,
  )
  setAppLoaded()
  yield* setupReceiveURLHandler().pipe(
    Stream.tap(_ =>
      _.pipe(
        Effect.tap(_ => appStateMachineInstance.actions.importGroupData(_)),
        Effect.tap(() =>
          Alert.alert({
            type: 'success',
            title: t('Success'),
            message: t('Group imported'),
          }),
        ),
        Effect.catchAll(e =>
          Alert.alert({
            type: 'error',
            title: t('Failed to import group'),
            message: Match.valueTags(e, {
              NewerVersionError: () => t('NewerVersionError'),
              OldVersionError: () => t('OldVersionError'),
              SystemError: () => t('UnableToAccessFileError'),
              BadArgument: () => t('UnableToAccessFileError'),
              ParseError: () => t('InvalidFileError'),
              FileTooLargeError: () => t('FileTooLargeError'),
            }),
          }),
        ),
        Effect.catchAllCause(() => Effect.void),
      ),
    ),
    Stream.runDrain,
    Effect.forkDaemon,
  )
  yield* Effect.logDebug('startApp done')
})
