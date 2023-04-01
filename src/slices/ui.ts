import { $op } from 'src/model/Optics'
import { replaceSApp } from 'src/services/StateRef'

export const setUpsertGroupModal = replaceSApp($op.ui.modalUpsertGroup.$)

export const setUpsertGroupName = replaceSApp($op.ui.modalUpsertGroup.name.$)

export const setDeleteGroupModal = replaceSApp($op.ui.modalDeleteGroup.$)
