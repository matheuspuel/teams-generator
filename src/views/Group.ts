import { A, Data, O, constant, flow, pipe } from 'fp'
import {
  FlatList,
  Header,
  MaterialIcons,
  Nothing,
  Pressable,
  SafeAreaView,
  Txt,
  View,
} from 'src/components'
import { Checkbox } from 'src/components/derivative/Checkbox'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { PreRender } from 'src/components/derivative/PreRender'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoized, memoizedConst, namedConst } from 'src/components/hyperscript'
import { GroupOrder, Player, Position, Rating } from 'src/datatypes'
import { appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import {
  getActiveModality,
  getPlayerFromSelectedGroup,
  getSelectedGroup,
} from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

const on = appEvents.group

export const GroupView = memoizedConst('GroupView')(() => {
  const playersIds = useSelector(s =>
    pipe(
      O.all({
        group: getSelectedGroup(s),
        modality: getActiveModality(s),
      }),
      O.map(({ group, modality }) =>
        pipe(
          A.sort(group.players, GroupOrder.toOrder(s.groupOrder)({ modality })),
          A.map(_ => _.id),
        ),
      ),
      O.getOrElse(() => []),
      Data.array,
    ),
  )
  return SafeAreaView({ flex: 1, edges: ['bottom'] })([
    GroupHeader,
    PreRender(
      View({ flex: 1, p: 8, gap: 8 })(
        A.replicate(3)(
          View({
            round: 8,
            bg: Colors.opacity(0.125)(Colors.gray),
            h: 40,
          })([]),
        ),
      ),
    )(
      FlatList({
        data: playersIds,
        keyExtractor: id => id,
        renderItem: Item,
        ListEmptyComponent: View({ flex: 1, justify: 'center' })([
          Txt({ size: 16, color: Colors.opacity(0.625)(Colors.gray) })(
            t('No players registered'),
          ),
        ]),
        contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
        initialNumToRender: 16,
      }),
    ),
    ShuffleButton,
  ])
})

const GroupHeader = memoizedConst('GroupHeader')(() =>
  View()([
    Header({
      title: t('Group'),
      headerLeft: HeaderButtonRow([
        HeaderButton({
          onPress: appEvents.back(),
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: on.player.new(),
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

const Item = memoized('Player')((id: Id) => {
  const player = useSelector(s =>
    pipe(
      getPlayerFromSelectedGroup({ playerId: id })(s),
      O.map(player => ({
        ...player,
        position: pipe(
          getActiveModality(s),
          O.flatMap(m =>
            A.findFirst(
              m.positions,
              p => p.abbreviation === player.positionAbbreviation,
            ),
          ),
        ),
      })),
      O.map(Data.struct),
    ),
  )
  return O.match(player, {
    onNone: () => Nothing,
    onSome: ({ active, name, position, rating }) =>
      Pressable({
        onPress: on.player.open(id),
        direction: 'row',
        align: 'center',
        gap: 8,
        round: 8,
        shadow: 1,
        bg: Colors.card,
      })([
        Checkbox({
          onToggle: on.player.active.toggle(id),
          isSelected: active,
          m: 8,
          mr: -8,
        }),
        View({
          p: 4,
          round: 12,
          bg: Colors.opacity(0.5)(Colors.primary),
          minW: 35,
        })([
          Txt({
            align: 'center',
            size: 18,
            weight: 600,
            includeFontPadding: false,
          })(
            O.match(position, {
              onNone: () => '-',
              onSome: Position.toAbbreviationString,
            }),
          ),
        ]),
        Txt({ size: 18, weight: 600 })(Rating.toString(rating)),
        Txt({ my: 8, numberOfLines: 1 })(name),
      ]),
  })
})

const ShuffleButton = namedConst('ShuffleButton')(() => {
  const numSelected = useSelector(
    flow(
      getSelectedGroup,
      O.match({
        onNone: constant<Array<Player>>([]),
        onSome: g => g.players,
      }),
      A.filter(p => p.active),
      A.length,
    ),
  )
  return SolidButton({
    onPress: on.parameters.open(),
    p: 16,
    round: 0,
    color: Colors.header,
  })([
    Txt()(t('Generate teams')),
    Txt({ size: 12 })(
      pipe(numSelected, n =>
        n === 0
          ? `(${t('No players selected')})`
          : n === 1
            ? `(${t('1 player selected')})`
            : `(${n.toString()} ${t('players selected')})`,
      ),
    ),
  ])
})
