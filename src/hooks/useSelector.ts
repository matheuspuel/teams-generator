import { makeUseSelector } from '@matheuspuel/state-machine/react'
import { appStateMachineInstance } from 'src/state'

export const useSelector = makeUseSelector(appStateMachineInstance)

export const useActions = () => appStateMachineInstance.actions
