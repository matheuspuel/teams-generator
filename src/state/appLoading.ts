import { StateMachine } from '@matheuspuel/state-machine'
import { makeUseSelector } from '@matheuspuel/state-machine/react'

const appLoadingStateMachine = StateMachine.of(true)

const appLoadingStateMachineInstance = StateMachine.run(appLoadingStateMachine)

export const setAppLoaded = () =>
  appLoadingStateMachineInstance.actions.set(false)

export const useAppLoading = () =>
  makeUseSelector(appLoadingStateMachineInstance)(_ => _)
