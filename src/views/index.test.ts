/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, create } from 'react-test-renderer'
import { GroupOrder, Parameters } from 'src/datatypes'
import { AppEvent, appEvents as on } from 'src/events'
import { AlertLive } from 'src/services/Alert/default'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { DocumentPickerEnv } from 'src/services/DocumentPicker'
import { FileSystemEnv } from 'src/services/FileSystem'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
import { MetadataServiceEnv } from 'src/services/Metadata'
import { RepositoryEnvs } from 'src/services/Repositories'
import { SafeAreaService } from 'src/services/SafeArea'
import { SafeAreaServiceTest } from 'src/services/SafeArea/testing'
import { ShareServiceEnv } from 'src/services/Share'
import { SplashScreenEnv } from 'src/services/SplashScreen'
import { AppStateRef } from 'src/services/StateRef'
import { StateRefLive } from 'src/services/StateRef/default'
import { TelemetryEnv } from 'src/services/Telemetry'
import { AppTheme } from 'src/services/Theme'
import { AppThemeLive } from 'src/services/Theme/default'
import { initialUIContext } from 'src/services/UI/context'
import { Id } from 'src/utils/Entity'
import { $, Clock, Effect, F, Layer, Num, Ref, pipe } from 'src/utils/fp'
import { UIRoot } from '.'

const testLayer = pipe(
  Layer.mergeAll(
    F.setClock(
      Clock.Clock.of({
        [Clock.ClockTypeId]: Clock.ClockTypeId,
        currentTimeMillis: F.succeed(0),
        currentTimeNanos: F.succeed(BigInt(0)),
        sleep: () => F.unit,
        unsafeCurrentTimeMillis: () => 0,
        unsafeCurrentTimeNanos: () => BigInt(0),
      }),
    ),
    StateRefLive,
    BackHandlerEnv.context({
      exit: () => F.unit,
      subscribe: () => F.succeed({ unsubscribe: F.unit }),
    }).pipe(Layer.succeedContext),
    FileSystemEnv.context({
      write: () => F.unit,
      read: () => F.succeed(''),
      copy: () => F.unit,
      cacheDirectory: () => F.succeed(''),
    }).pipe(Layer.succeedContext),
    DocumentPickerEnv.context({
      getDocument: () => F.succeed({ uri: '' }),
    }).pipe(Layer.succeedContext),
    ShareServiceEnv.context({
      shareMessage: () => F.unit,
      shareFile: () => F.unit,
    }).pipe(Layer.succeedContext),
    SplashScreenEnv.context({
      hide: () => F.unit,
      preventAutoHide: () => F.unit,
    }).pipe(Layer.succeedContext),
    IdGeneratorEnv.context({
      generate: $(
        Ref.make(0).pipe(F.runSync),
        ref => () =>
          $(
            Ref.get(ref),
            F.map(Num.increment),
            F.tap(v => Ref.set(ref, v)),
            F.map(n => Id(n.toString())),
          ),
      ),
    }).pipe(Layer.succeedContext),
    TelemetryEnv.context({ log: () => F.unit, send: () => F.unit }).pipe(
      Layer.succeedContext,
    ),
    MetadataServiceEnv.context({
      get: () =>
        F.succeed({
          application: {
            native: { buildVersion: null, version: null },
            version: 'test',
          },
          device: {
            modelName: null,
            osVersion: null,
            platformApiLevel: null,
          },
          installation: { id: '' },
          launch: { id: '' },
          isFirstLaunch: false,
        }),
    }).pipe(Layer.succeedContext),
    RepositoryEnvs.teams.groups
      .context({ get: () => F.succeed({}), set: () => F.unit })
      .pipe(Layer.succeedContext),
    RepositoryEnvs.teams.parameters
      .context({ get: () => F.succeed(Parameters.initial), set: () => F.unit })
      .pipe(Layer.succeedContext),
    RepositoryEnvs.teams.groupOrder
      .context({ get: () => F.succeed(GroupOrder.initial), set: () => F.unit })
      .pipe(Layer.succeedContext),
    AppThemeLive,
    SafeAreaServiceTest,
  ),
  Layer.provideMerge(AlertLive),
)

const dispatch = (e: AppEvent) =>
  e.pipe(F.provideLayer(testLayer), F.runPromise)

it('renders', async () => {
  await dispatch(on.core.appLoaded())

  const UI = F.map(
    F.all({
      context: F.succeed(initialUIContext),
      runtime: F.runtime<
        Effect.Context<AppEvent> | AppTheme | SafeAreaService | AppStateRef
      >(),
    }),
    env => UIRoot(env),
  ).pipe(F.provideLayer(testLayer), F.runSync)

  const ui = create(UI)
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.groups.item.upsert.new())
    await dispatch(on.groups.item.upsert.form.name.change('group 1'))
    await dispatch(on.groups.item.upsert.submit())
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.groups.item.open(Id('1')))
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.group.player.new())
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.player.name.change('player 1'))
    await dispatch(on.player.position.change('G'))
    await dispatch(on.player.rating.change(1.5))
    await dispatch(on.player.save())
    await dispatch(on.group.parameters.open())
    await dispatch(on.group.parameters.shuffle())
  })
  expect(ui.toJSON()).toMatchSnapshot()
})
