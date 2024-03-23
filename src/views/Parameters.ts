import { Equivalence as SchemaEquivalence } from '@effect/schema'
import { Match, pipe } from 'effect'
import { MaterialIcons, Pressable, Row, Txt, View } from 'src/components'
import { BorderlessButton } from 'src/components/derivative/BorderlessButton'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { Checkbox } from 'src/components/derivative/Checkbox'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { namedConst } from 'src/components/hyperscript'
import { Parameters } from 'src/datatypes/Parameters'
import { back } from 'src/events/core'
import {
  decrementTeamsCount,
  generateResult,
  incrementTeamsCount,
  togglePositionParameter,
  toggleRatingParameter,
  toggleTeamsCountType,
} from 'src/events/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'

export const ParametersView = namedConst('ParametersView')(() => {
  const parameters = useSelector(
    s => s.parameters,
    SchemaEquivalence.make(Parameters),
  )
  return CenterModal({
    onClose: back,
    title: t('Parameters'),
    m: 24,
  })([
    View({ p: 16 })([
      Row({ align: 'center' })([
        BorderlessButton({ onPress: decrementTeamsCount })([
          MaterialIcons({ name: 'remove' }),
        ]),
        Txt({ p: 8, weight: 600 })(
          pipe(
            parameters.teamsCountMethod,
            Match.valueTags({
              count: () => parameters.teamsCount.toString(),
              playersRequired: () => parameters.playersRequired.toString(),
            }),
          ),
        ),
        BorderlessButton({ onPress: incrementTeamsCount })([
          MaterialIcons({ name: 'add' }),
        ]),
        GhostButton({
          onPress: toggleTeamsCountType,
          flex: 1,
          direction: 'row',
          align: 'center',
          p: 4,
          pl: 8,
          gap: 4,
          color: Colors.text.normal,
        })([
          Txt({ flex: 1 })(
            pipe(
              parameters.teamsCountMethod,
              Match.valueTags({
                count: () => t('Number of teams'),
                playersRequired: () => t('Fixed number of players per team'),
              }),
            ),
          ),
          MaterialIcons({
            name: 'swap-horiz',
            size: 20,
            color: Colors.primary,
          }),
        ]),
      ]),
      Pressable({
        onPress: togglePositionParameter,
        direction: 'row',
        align: 'center',
        p: 8,
        round: 8,
        bg: Colors.opacity(0)(Colors.white),
      })([
        Checkbox({
          onToggle: togglePositionParameter,
          isSelected: parameters.position,
        }),
        Txt({ ml: 8, size: 14 })(t('Consider positions')),
      ]),
      Pressable({
        onPress: toggleRatingParameter,
        direction: 'row',
        align: 'center',
        p: 8,
        round: 8,
        bg: Colors.opacity(0)(Colors.white),
      })([
        Checkbox({
          onToggle: toggleRatingParameter,
          isSelected: parameters.rating,
        }),
        Txt({ ml: 8, size: 14 })(t('Consider rating')),
      ]),
    ]),
    View({
      borderWidthT: 1,
      borderColor: Colors.opacity(0.375)(Colors.gray),
    })([]),
    Row({ p: 16, gap: 8, justify: 'end' })([
      GhostButton({ onPress: back })([Txt()(t('Cancel'))]),
      SolidButton({ onPress: generateResult })([Txt()(t('Generate teams'))]),
    ]),
  ])
})
