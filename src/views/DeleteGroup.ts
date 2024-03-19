import { Option, ReadonlyArray, pipe } from 'effect'
import { Row, Txt, TxtContext, View } from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { namedConst } from 'src/components/hyperscript'
import { appEvents } from 'src/events'
import { back } from 'src/events/core'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getSelectedGroup } from 'src/slices/groups'

const on = appEvents.group

export const DeleteGroupView = namedConst('DeleteGroupView')(() => {
  const group = useSelector(getSelectedGroup)
  return CenterModal({ onClose: back(), title: t('Delete group') })([
    View({ p: 16 })(
      pipe(
        group,
        Option.map(g =>
          TxtContext({ align: 'left' })([
            Txt({ align: 'left' })(`${t('Want to delete the group')} `),
            Txt({ weight: 600 })(g.name),
            Txt()(` ${t('and all its players?')}`),
          ]),
        ),
        ReadonlyArray.fromOption,
      ),
    ),
    View({ borderWidthT: 1, borderColor: Colors.opacity(0.375)(Colors.gray) })(
      [],
    ),
    Row({ p: 16, gap: 8, justify: 'end' })([
      GhostButton({ onPress: back(), color: Colors.error })([
        Txt()(t('Cancel')),
      ]),
      SolidButton({
        onPress: on.delete.submit(),
        color: Colors.error,
      })([Txt()(t('Delete'))]),
    ]),
  ])
})
