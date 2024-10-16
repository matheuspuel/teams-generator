import { Array, Data, Equal, Option, Record, Tuple, flow, pipe } from 'effect'
import {
  FlatList,
  Header,
  MaterialIcons,
  Nothing,
  Pressable,
  Txt,
  View,
} from 'src/components'
import { BannerAd } from 'src/components/custom/BannerAd'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { memoized, memoizedConst } from 'src/components/hyperscript'
import { Group } from 'src/datatypes'
import { hideSplashScreen } from 'src/events/core'
import { openGroup, openHomeMenu, startCreateGroup } from 'src/events/groups'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import { getGroupById, getModality } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

export const GroupsView = memoizedConst('GroupsView')(() => {
  const groupsIds = useSelector(
    flow(
      s => s.groups,
      Record.toEntries,
      Array.map(Tuple.getSecond),
      Array.sort(Group.NameOrd),
      Array.map(_ => _.id),
      Data.array,
    ),
  )
  return View({ flex: 1, onLayout: hideSplashScreen })([
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
    BannerAd,
  ])
})

const ScreenHeader = memoizedConst('Header')(() =>
  View()([
    Header({
      title: t('Groups'),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: startCreateGroup,
          icon: MaterialIcons({ name: 'add' }),
        }),
        HeaderButton({
          onPress: openHomeMenu,
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
      Option.map(({ name, modality }) =>
        Data.struct({
          name,
          modality: pipe(
            getModality(modality)(s),
            Option.map(_ => _.name),
          ),
        }),
      ),
    ),
  )
  return Option.match(group, {
    onNone: () => Nothing,
    onSome: ({ name, modality }) =>
      Pressable({
        onPress: openGroup(id),
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
        })(Option.getOrElse(modality, () => '-')),
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
