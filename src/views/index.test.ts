/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, create } from 'react-test-renderer'
import { AppEvent, appEventHandler, on } from 'src/actions'
import { GroupOrder, Parameters } from 'src/datatypes'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
import {
  GroupOrderRepositoryEnv,
  GroupsRepositoryEnv,
  ParametersRepositoryEnv,
} from 'src/services/Repositories'
import { testingSafeAreaService } from 'src/services/SafeArea/testing'
import { ShareServiceEnv } from 'src/services/Share'
import { SplashScreenEnv } from 'src/services/SplashScreen'
import { AppStateRefEnv } from 'src/services/StateRef'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { Id } from 'src/utils/Entity'
import { Ref } from 'src/utils/datatypes'
import { $, Eff, Num } from 'src/utils/fp'
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
  $(
    appEventHandler(e),
    Eff.provideService(AppStateRefEnv, { stateRef }),
    Eff.provideService(BackHandlerEnv, {
      backHandler: {
        exit: Eff.unit(),
        subscribe: () => Eff.succeed({ unsubscribe: Eff.unit() }),
      },
    }),
    Eff.provideService(ShareServiceEnv, { share: { share: () => Eff.unit() } }),
    Eff.provideService(SplashScreenEnv, {
      splashScreen: { hide: Eff.unit(), preventAutoHide: Eff.unit() },
    }),
    Eff.provideService(IdGeneratorEnv, { idGenerator }),
    Eff.provideService(GroupsRepositoryEnv, {
      repositories: { Groups: { get: Eff.succeed({}), set: () => Eff.unit() } },
    }),
    Eff.provideService(ParametersRepositoryEnv, {
      repositories: {
        Parameters: {
          get: Eff.succeed(Parameters.initial),
          set: () => Eff.unit(),
        },
      },
    }),
    Eff.provideService(GroupOrderRepositoryEnv, {
      repositories: {
        GroupOrder: {
          get: Eff.succeed(GroupOrder.initial),
          set: () => Eff.unit(),
        },
      },
    }),
  )

const dispatch = (e: AppEvent) => Eff.runPromise(eventHandler(e))

it('renders', async () => {
  await dispatch(on.appLoaded)
  const UI = UIRoot({
    theme: defaultTheme,
    safeArea: testingSafeAreaService,
    stateRef,
    eventHandler: eventHandler,
  })

  const ui = create(UI)
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.openNewGroupModal)
    await dispatch(on.changeGroupName('group 1'))
    await dispatch(on.saveGroup)
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.selectGroup(Id('1')))
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.pressNewPlayer)
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.changePlayerName('player 1'))
    await dispatch(on.changePlayerPosition('G'))
    await dispatch(on.changePlayerRating(1.5))
    await dispatch(on.savePlayer)
    await dispatch(on.openParametersModal)
    await dispatch(on.shuffle)
  })
  expect(ui.toJSON()).toMatchSnapshot()
})
