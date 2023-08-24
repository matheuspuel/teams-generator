/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, create } from 'react-test-renderer'
import { GroupOrder, Parameters } from 'src/datatypes'
import { AppEvent, appEvents as on } from 'src/events'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { AppEventHandler, AppEventHandlerEnv } from 'src/services/EventHandler'
import { AppEventHandlerLive } from 'src/services/EventHandler/default'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
import { MetadataServiceEnv } from 'src/services/Metadata'
import { RepositoryEnvs } from 'src/services/Repositories'
import { SafeAreaServiceEnv } from 'src/services/SafeArea'
import { SafeAreaServiceTest } from 'src/services/SafeArea/testing'
import { ShareServiceEnv } from 'src/services/Share'
import { SplashScreenEnv } from 'src/services/SplashScreen'
import { AppStateRefEnv } from 'src/services/StateRef'
import { StateRefLive } from 'src/services/StateRef/default'
import { TelemetryEnv } from 'src/services/Telemetry'
import { AppThemeEnv } from 'src/services/Theme'
import { AppThemeLive } from 'src/services/Theme/default'
import { Id } from 'src/utils/Entity'
import { Ref } from 'src/utils/datatypes'
import { $, Clock, F, Layer, Num, pipe } from 'src/utils/fp'
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
      exit: F.unit,
      subscribe: () => F.succeed({ unsubscribe: F.unit }),
    }).pipe(Layer.succeedContext),
    ShareServiceEnv.context({ share: () => F.unit }).pipe(Layer.succeedContext),
    SplashScreenEnv.context({ hide: F.unit, preventAutoHide: F.unit }).pipe(
      Layer.succeedContext,
    ),
    IdGeneratorEnv.context({
      generate: $(
        Ref.create(0),
        ref => () =>
          $(
            ref.getState,
            F.map(Num.increment),
            F.tap(ref.setState),
            F.map(n => Id(n.toString())),
          ),
      ),
    }).pipe(Layer.succeedContext),
    TelemetryEnv.context({ log: () => F.unit, send: F.unit }).pipe(
      Layer.succeedContext,
    ),
    MetadataServiceEnv.context({
      get: F.succeed({
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
      .context({ get: F.succeed({}), set: () => F.unit })
      .pipe(Layer.succeedContext),
    RepositoryEnvs.teams.parameters
      .context({ get: F.succeed(Parameters.initial), set: () => F.unit })
      .pipe(Layer.succeedContext),
    RepositoryEnvs.teams.groupOrder
      .context({ get: F.succeed(GroupOrder.initial), set: () => F.unit })
      .pipe(Layer.succeedContext),
    AppThemeLive,
    SafeAreaServiceTest,
  ),
  Layer.provideMerge(AppEventHandlerLive),
)

const dispatch = (e: AppEvent) =>
  AppEventHandler.handle(e).pipe(F.provideLayer(testLayer), F.runPromise)

it('renders', async () => {
  await dispatch(on.core.appLoaded())

  const UI = F.map(
    F.all({
      Theme: AppThemeEnv,
      SafeArea: SafeAreaServiceEnv,
      EventHandler: AppEventHandlerEnv,
      StateRef: AppStateRefEnv,
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
