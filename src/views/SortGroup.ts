import { Option } from 'effect'
import {
  MaterialCommunityIcons,
  Nothing,
  Pressable,
  Txt,
  View,
} from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { namedConst } from 'src/components/hyperscript'
import { AppEvent, appEvents } from 'src/events'
import { back } from 'src/events/core'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'

const on = appEvents.group

export const SortGroupView = namedConst('SortGroupView')(() => {
  const mainSort = useSelector(s => s.groupOrder[0])
  return CenterModal({ onClose: back(), title: t('Sorting') })([
    View({ roundB: 8, overflow: 'hidden' })([
      FilterButton({
        name: t('Name'),
        onPress: on.sort.by.name(),
        state:
          mainSort._tag === 'name'
            ? Option.some({ reverse: mainSort.reverse })
            : Option.none(),
      }),
      FilterButton({
        name: t('Position'),
        onPress: on.sort.by.position(),
        state:
          mainSort._tag === 'position'
            ? Option.some({ reverse: mainSort.reverse })
            : Option.none(),
      }),
      FilterButton({
        name: t('Rating'),
        onPress: on.sort.by.rating(),
        state:
          mainSort._tag === 'rating'
            ? Option.some({ reverse: mainSort.reverse })
            : Option.none(),
      }),
      FilterButton({
        name: t('Active'),
        onPress: on.sort.by.active(),
        state:
          mainSort._tag === 'active'
            ? Option.some({ reverse: mainSort.reverse })
            : Option.none(),
      }),
      FilterButton({
        name: t('Date'),
        onPress: on.sort.by.date(),
        state:
          mainSort._tag === 'date'
            ? Option.some({ reverse: mainSort.reverse })
            : Option.none(),
      }),
    ]),
  ])
})

const FilterButton = (props: {
  state: Option.Option<{ reverse: boolean }>
  onPress: AppEvent
  name: string
}) =>
  Pressable({
    direction: 'row',
    align: 'center',
    p: 16,
    onPress: props.onPress,
  })([
    View({ w: 36 })([
      Option.match(props.state, {
        onNone: () => Nothing,
        onSome: ({ reverse }) =>
          MaterialCommunityIcons({
            name: reverse ? 'sort-descending' : 'sort-ascending',
            color: Colors.primary,
          }),
      }),
    ]),
    Txt({ flex: 1, align: 'left' })(props.name),
  ])
