/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, create } from 'react-test-renderer'
import { GroupOrder, Parameters } from 'src/datatypes'
import { AppEvent, appEvents as on } from 'src/events'
import { appEventHandler } from 'src/events/handler'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
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
import { $, Context, Eff, Num } from 'src/utils/fp'
import { UIRoot } from '.'

const stateRef = defaultStateRef

const idGenerator = {
  generate: $(Ref.create(0), ref =>
    $(
      ref.getState,
      Eff.map(Num.increment),
      Eff.tap(ref.setState),
      Eff.map(n => Id(n.toString())),
    ),
  ),
}

const eventHandler = (e: AppEvent) =>
  Eff.provideContext(
    appEventHandler(e),
    Context.mergedContext(
      AppStateRefEnv,
      BackHandlerEnv,
      ShareServiceEnv,
      SplashScreenEnv,
      IdGeneratorEnv,
      TelemetryEnv,
      RepositoryEnvs.teams.groupOrder,
      RepositoryEnvs.teams.groups,
      RepositoryEnvs.teams.parameters,
    )({
      stateRef,
      backHandler: {
        exit: Eff.unit(),
        subscribe: () => Eff.succeed({ unsubscribe: Eff.unit() }),
      },
      share: { share: () => Eff.unit() },
      splashScreen: { hide: Eff.unit(), preventAutoHide: Eff.unit() },
      idGenerator,
      Telemetry: { log: () => Eff.unit(), send: Eff.unit() },
      Repositories: {
        teams: {
          groups: { get: Eff.succeed({}), set: () => Eff.unit() },
          parameters: {
            get: Eff.succeed(Parameters.initial),
            set: () => Eff.unit(),
          },
          groupOrder: {
            get: Eff.succeed(GroupOrder.initial),
            set: () => Eff.unit(),
          },
        },
      },
    }),
  )

const dispatch = (e: AppEvent) => Eff.runPromise(eventHandler(e))

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
