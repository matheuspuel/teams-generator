import { StateMachine } from '@matheuspuel/state-machine'
import { makeUseSelector } from '@matheuspuel/state-machine/react'

const alertStateMachine = StateMachine.of<{
  title: string
  message: string
  type: 'error' | 'success'
} | null>(null)

const alertStateMachineInstance = StateMachine.run(alertStateMachine)

export const alertActions = alertStateMachineInstance.actions

export const useAlertState = makeUseSelector(alertStateMachineInstance)
