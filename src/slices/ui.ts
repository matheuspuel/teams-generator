import { root } from 'src/model/optic'
import { StateRef } from 'src/services/StateRef'

export const setUpsertGroupModal = StateRef.on(
  root.at('ui').at('modalUpsertGroup'),
).set

export const setUpsertGroupName = StateRef.onOption(
  root.at('ui').at('modalUpsertGroup').some_().at('name'),
).set

export const setDeleteGroupModal = StateRef.on(
  root.at('ui').at('modalDeleteGroup'),
).set
