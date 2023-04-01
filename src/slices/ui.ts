import { root } from 'src/model/Optics'
import { replaceSApp } from 'src/services/StateRef'

export const setUpsertGroupModal = replaceSApp(root.ui.modalUpsertGroup.$)

export const setUpsertGroupName = replaceSApp(root.ui.modalUpsertGroup.name.$)

export const setDeleteGroupModal = replaceSApp(root.ui.modalDeleteGroup.$)
