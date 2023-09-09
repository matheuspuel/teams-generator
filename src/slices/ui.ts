import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'

export const setUpsertGroupModal = State.on(
  root.at('ui').at('modalUpsertGroup'),
).set

export const setUpsertGroupName = State.onOption(
  root.at('ui').at('modalUpsertGroup').some_().at('name'),
).set

export const setDeleteGroupModal = State.on(
  root.at('ui').at('modalDeleteGroup'),
).set
