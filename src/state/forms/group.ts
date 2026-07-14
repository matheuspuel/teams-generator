import { Form } from '@matheuspuel/state-machine'
import { makeStateMachineContext } from '@matheuspuel/state-machine/react'
import type { Modality } from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'

const groupFormStateMachine = Form.Struct({
  name: Form.Field.TrimNonEmptyString,
  modality: Form.Field.of<Modality.Reference>(soccer),
})

export const GroupForm = makeStateMachineContext(groupFormStateMachine)
