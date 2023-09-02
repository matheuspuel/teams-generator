import { root } from 'src/model/optic'
import { replaceSApp } from 'src/services/StateRef'

export const setUpsertGroupModal = replaceSApp(
  root.at('ui').at('modalUpsertGroup'),
)

export const setUpsertGroupName = replaceSApp(
  root.at('ui').at('modalUpsertGroup').some_().at('name'),
)

export const setDeleteGroupModal = replaceSApp(
  root.at('ui').at('modalDeleteGroup'),
)
