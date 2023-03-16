import { Optic } from 'fp'
import { replaceSApp } from 'src/services/Store'
import { RootOptic } from '.'

export const UiLens = RootOptic.at('ui')

export const getUi = Optic.get(UiLens)

export const setUpsertGroupModal = replaceSApp(UiLens.at('modalUpsertGroup'))

export const setUpsertGroupName = replaceSApp(
  UiLens.at('modalUpsertGroup').compose(Optic.some()).at('name'),
)

export const setDeleteGroupModal = replaceSApp(UiLens.at('modalDeleteGroup'))
