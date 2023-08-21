/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, create } from 'react-test-renderer'
import { GroupOrder, Parameters } from 'src/datatypes'
import { AppEvent, appEvents as on } from 'src/events'
import { appEventHandler } from 'src/events/handler'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
import { MetadataEnv } from 'src/services/Metadata'
import { RepositoryEnvs } from 'src/services/Repositories'
import { testingSafeAreaService } from 'src/services/SafeArea/testing'
import { ShareServiceEnv } from 'src/services/Share'
import { SplashScreenEnv } from 'src/services/SplashScreen'
import { AppStateRefEnv } from 'src/services/StateRef'
import { defaultStateRef } from 'src/services/StateRef/default'
import { TelemetryEnv } from 'src/services/Telemetry'
import { defaultTheme } from 'src/services/Theme/default'
import { Id } from 'src/utils/Entity'
import { Ref } from 'src/utils/datatypes'
import { $, Context, F, Num } from 'src/utils/fp'
import { UIRoot } from '.'

const stateRef = defaultStateRef

const idGenerator = {
  generate: $(Ref.create(0), ref =>
    $(
      ref.getState,
      F.map(Num.increment),
      F.tap(ref.setState),
      F.map(n => Id(n.toString())),
    ),
  ),
}

const eventHandler = (e: AppEvent) =>
  F.provideContext(
    appEventHandler(e),
    Context.mergedContext(
      AppStateRefEnv,
      BackHandlerEnv,
      ShareServiceEnv,
      SplashScreenEnv,
      IdGeneratorEnv,
      TelemetryEnv,
      MetadataEnv,
      RepositoryEnvs.teams.groupOrder,
      RepositoryEnvs.teams.groups,
      RepositoryEnvs.teams.parameters,
    )({
      stateRef,
      backHandler: {
        exit: F.unit,
        subscribe: () => F.succeed({ unsubscribe: F.unit }),
      },
      share: { share: () => F.unit },
      splashScreen: { hide: F.unit, preventAutoHide: F.unit },
      idGenerator,
      Telemetry: { log: () => F.unit, send: F.unit },
      Metadata: {
        get: F.succeed({
          application: {
            native: { buildVersion: null, version: null },
            version: 'test',
          },
          device: { modelName: null, osVersion: null, platformApiLevel: null },
          installation: { id: '' },
          launch: { id: '' },
          isFirstLaunch: false,
        }),
      },
      Repositories: {
        teams: {
          groups: { get: F.succeed({}), set: () => F.unit },
          parameters: {
            get: F.succeed(Parameters.initial),
            set: () => F.unit,
          },
          groupOrder: {
            get: F.succeed(GroupOrder.initial),
            set: () => F.unit,
          },
        },
      },
    }),
  )

const dispatch = (e: AppEvent) => F.runPromise(eventHandler(e))

it('renders', async () => {
  await dispatch(on.core.appLoaded())
  const UI = UIRoot({
    theme: defaultTheme,
    safeArea: testingSafeAreaService,
    stateRef,
    eventHandler: eventHandler,
  })

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
