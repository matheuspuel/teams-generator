/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, render } from '@testing-library/react-native'
import { makeEventHandler, on } from 'src/actions'
import { Parameters } from 'src/datatypes'
import { testingSafeAreaService } from 'src/services/SafeArea/testing'
import { defaultStateRef } from 'src/services/StateRef/default'
import { defaultTheme } from 'src/services/Theme/default'
import { Id } from 'src/utils/Entity'
import { Ref } from 'src/utils/datatypes'
import { $, IO, Num, RIO, T, TE } from 'src/utils/fp'
import { UIRoot } from '.'

const stateRef = defaultStateRef

const eventHandler = makeEventHandler({
  stateRef,
  idGenerator: {
    generate: $(Ref.create(0), ref =>
      $(
        ref.getState,
        IO.map(Num.increment),
        IO.chainFirst(ref.setState),
        IO.map(n => Id(n.toString())),
      ),
    ),
  },
  backHandler: {
    exit: IO.of(undefined),
    subscribe: () => RIO.of({ unsubscribe: IO.of(undefined) }),
  },
  share: { share: () => T.of(undefined) },
  splashScreen: { hide: T.of(undefined), preventAutoHide: T.of(undefined) },
  repositories: {
    Groups: { get: TE.right({}), set: () => TE.of(undefined) },
    Parameters: {
      get: TE.right(Parameters.initial),
      set: () => TE.of(undefined),
    },
  },
})
const dispatch = eventHandler

it('renders', async () => {
  dispatch(on.appLoaded)()
  const UI = UIRoot({
    theme: defaultTheme,
    safeArea: testingSafeAreaService,
    stateRef,
    eventHandler,
  })

  const ui = render(UI)
  expect(ui.toJSON()).toMatchSnapshot()
  await act(() => {
    dispatch(on.openNewGroupModal)()
    dispatch(on.changeGroupName('group 1'))()
    dispatch(on.saveGroup)()
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(() => {
    dispatch(on.selectGroup(Id('1')))()
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(() => {
    dispatch(on.pressNewPlayer)()
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    dispatch(on.changePlayerName('player 1'))()
    dispatch(on.changePlayerPosition('G'))()
    dispatch(on.changePlayerRating(1.5))()
    dispatch(on.savePlayer)()
    dispatch(on.openParametersModal)()
    await dispatch(on.shuffle)()
  })
  expect(ui.toJSON()).toMatchSnapshot()
})
