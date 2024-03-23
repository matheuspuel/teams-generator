import { MaterialCommunityIcons, MaterialIcons } from 'src/components'
import { HeaderMenu } from 'src/components/derivative/HeaderMenu'
import { HeaderMenuButton } from 'src/components/derivative/HeaderMenuButton'
import { namedConst } from 'src/components/hyperscript'
import { back } from 'src/events/core'
import {
  exportGroup,
  openDeleteGroup,
  openGroupSort,
  toggleAllPlayers,
} from 'src/events/group'
import { startEditGroup } from 'src/events/groups'
import { t } from 'src/i18n'

export const GroupMenuView = namedConst('GroupMenuView')(() => {
  return HeaderMenu({ onClose: back })([
    HeaderMenuButton({
      onPress: toggleAllPlayers,
      label: t('Select all'),
      icon: MaterialCommunityIcons({ name: 'checkbox-multiple-outline' }),
    }),
    HeaderMenuButton({
      onPress: openGroupSort,
      label: t('Sort'),
      icon: MaterialIcons({ name: 'sort' }),
    }),
    HeaderMenuButton({
      onPress: exportGroup,
      label: t('Export group'),
      icon: MaterialCommunityIcons({ name: 'export' }),
    }),
    HeaderMenuButton({
      onPress: startEditGroup,
      label: t('Edit group'),
      icon: MaterialIcons({ name: 'edit' }),
    }),
    HeaderMenuButton({
      onPress: openDeleteGroup,
      label: t('Delete group'),
      icon: MaterialIcons({ name: 'delete-outline' }),
    }),
  ])
})
