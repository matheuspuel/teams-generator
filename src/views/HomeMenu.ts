import { MaterialCommunityIcons, MaterialIcons } from 'src/components'
import { HeaderMenu } from 'src/components/derivative/HeaderMenu'
import { HeaderMenuButton } from 'src/components/derivative/HeaderMenuButton'
import { namedConst } from 'src/components/hyperscript'
import { appEvents } from 'src/events'
import { back } from 'src/events/core'
import { t } from 'src/i18n'

const on = appEvents.groups

export const HomeMenuView = namedConst('HomeMenuView')(() => {
  return HeaderMenu({ onClose: back() })([
    HeaderMenuButton({
      onPress: on.import(),
      label: t('Import group'),
      icon: MaterialCommunityIcons({ name: 'import' }),
    }),
    HeaderMenuButton({
      onPress: appEvents.modality.go(),
      label: t('Edit modalities'),
      icon: MaterialIcons({ name: 'sports-soccer' }),
    }),
  ])
})
