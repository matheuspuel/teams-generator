import { MaterialCommunityIcons, MaterialIcons } from 'src/components'
import { HeaderMenu } from 'src/components/derivative/HeaderMenu'
import { HeaderMenuButton } from 'src/components/derivative/HeaderMenuButton'
import { namedConst } from 'src/components/hyperscript'
import { back } from 'src/events/core'
import { importGroup } from 'src/events/groups'
import { goToModality } from 'src/events/modality'
import { t } from 'src/i18n'

export const HomeMenuView = namedConst('HomeMenuView')(() => {
  return HeaderMenu({ onClose: back() })([
    HeaderMenuButton({
      onPress: importGroup(),
      label: t('Import group'),
      icon: MaterialCommunityIcons({ name: 'import' }),
    }),
    HeaderMenuButton({
      onPress: goToModality(),
      label: t('Edit modalities'),
      icon: MaterialIcons({ name: 'sports-soccer' }),
    }),
  ])
})
