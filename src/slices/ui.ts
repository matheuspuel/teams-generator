import { root } from 'src/model/optic'
import { State } from 'src/services/StateRef'

export const setGroupName = State.on(root.at('groupForm').at('name')).set

export const setGroupModality = State.on(
  root.at('groupForm').at('modality'),
).set

export const setDeleteGroupModal = State.on(
  root.at('ui').at('modalDeleteGroup'),
).set
