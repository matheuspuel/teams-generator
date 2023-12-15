import { A, Data, Equal, O, Record, Tuple, flow, pipe } from 'fp'
import {
  FlatList,
  Header,
  MaterialIcons,
  Nothing,
  Pressable,
  Txt,
  View,
} from 'src/components'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { memoized, memoizedConst } from 'src/components/hyperscript'
import { Group } from 'src/datatypes'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getGroupById, getModality } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

const on = appEvents.groups

export const GroupsView = memoizedConst('GroupsView')(() => {
  const groupsIds = useSelector(
    flow(
      s => s.groups,
      Record.toEntries,
      A.map(Tuple.getSecond),
      A.sort(Group.NameOrd),
      A.map(_ => _.id),
      Data.array,
    ),
  )
  return View({ flex: 1, onLayout: appEvents.core.uiMount() })([
    ScreenHeader,
    FlatList({
      data: groupsIds,
      keyExtractor: id => id,
      renderItem: Item,
      ListEmptyComponent: View({ flex: 1, justify: 'center' })([
        Txt({ size: 16, color: Colors.opacity(0.625)(Colors.gray) })(
          t('No groups registered'),
        ),
      ]),
      contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
      initialNumToRender: 16,
    }),
  ])
})

const ScreenHeader = memoizedConst('Header')(() =>
  View()([
    Header({
      title: t('Groups'),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: on.item.upsert.new(),
          icon: MaterialIcons({ name: 'add' }),
        }),
        HeaderButton({
          onPress: on.menu.open(),
          icon: MaterialIcons({ name: 'more-vert' }),
        }),
      ]),
    }),
  ]),
)

const Item = memoized('Group')(Equal.equivalence(), (id: Id) => {
  const group = useSelector(s =>
    pipe(
      getGroupById(id)(s),
      O.map(({ name, modality }) =>
        Data.struct({
          name,
          modality: pipe(
            getModality(modality)(s),
            O.map(_ => _.name),
          ),
        }),
      ),
    ),
  )
  return O.match(group, {
    onNone: () => Nothing,
    onSome: ({ name, modality }) =>
      Pressable({
        onPress: on.item.open(id),
        p: 12,
        round: 8,
        shadow: 1,
        bg: Colors.card,
      })([
        Txt({
          numberOfLines: 1,
          flex: 1,
          align: 'left',
          weight: 600,
          color: Colors.text.secondary,
          size: 10,
        })(O.getOrElse(modality, () => '-')),
        Txt({
          numberOfLines: 1,
          flex: 1,
          align: 'left',
          weight: 600,
          size: 16,
        })(name),
      ]),
  })
})
