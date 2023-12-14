import { MaterialCommunityIcons, MaterialIcons } from 'src/components'
import { HeaderMenu } from 'src/components/derivative/HeaderMenu'
import { HeaderMenuButton } from 'src/components/derivative/HeaderMenuButton'
import { namedConst } from 'src/components/hyperscript'
import { appEvents } from 'src/events'
import { back } from 'src/events/core'
import { t } from 'src/i18n'

const on = appEvents.group

export const GroupMenuView = namedConst('GroupMenuView')(() => {
  return HeaderMenu({ onClose: back() })([
    HeaderMenuButton({
      onPress: on.player.active.toggleAll(),
      label: t('Select all'),
      icon: MaterialCommunityIcons({ name: 'checkbox-multiple-outline' }),
    }),
    HeaderMenuButton({
      onPress: on.sort.open(),
      label: t('Sort'),
      icon: MaterialIcons({ name: 'sort' }),
    }),
    HeaderMenuButton({
      onPress: on.export(),
      label: t('Export group'),
      icon: MaterialCommunityIcons({ name: 'export' }),
    }),
    HeaderMenuButton({
      onPress: appEvents.groups.item.upsert.edit(),
      label: t('Edit group'),
      icon: MaterialIcons({ name: 'edit' }),
    }),
    HeaderMenuButton({
      onPress: on.delete.open(),
      label: t('Delete group'),
      icon: MaterialIcons({ name: 'delete-outline' }),
    }),
  ])
})
