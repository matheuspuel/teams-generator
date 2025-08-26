import { Array, Data, Option, flow, pipe } from 'effect'
import { constant } from 'effect/Function'
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
import { back } from 'src/events/core'
import {
  openGroupMenu,
  openParameters,
  openPlayer,
  startNewPlayer,
  togglePlayerActive,
} from 'src/events/group'
import { useSelector } from 'src/hooks/useSelector'
import { t } from 'src/i18n'
import { Colors } from 'src/services/Theme'
import {
  getActiveModality,
  getPlayerFromSelectedGroup,
  getSelectedGroup,
} from 'src/slices/groups'
import { Id } from 'src/utils/Entity'

export const GroupView = memoizedConst('GroupView')(() => {
  const playersIds = useSelector(_ =>
    Option.gen(function* () {
      const group = yield* getSelectedGroup(_)
      const modality = yield* getActiveModality(_)
      return Array.sort(
        group.players,
        GroupOrder.toOrder(_.groupOrder)({ modality }),
      ).map(_ => _.id)
    }).pipe(
      Option.getOrElse(() => []),
      Data.array,
    ),
  )
  return SafeAreaView({ flex: 1, edges: ['bottom'] })([
    GroupHeader,
    PreRender(
      View({ flex: 1, p: 8, gap: 8 })(
        Array.replicate(3)(
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
          onPress: back,
          icon: MaterialIcons({ name: 'arrow-back' }),
        }),
      ]),
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: startNewPlayer,
          icon: MaterialIcons({ name: 'add' }),
        }),
        HeaderButton({
          onPress: openGroupMenu,
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
      Option.map(player => ({
        ...player,
        position: pipe(
          getActiveModality(s),
          Option.flatMap(m =>
            Array.findFirst(
              m.positions,
              p => p.abbreviation === player.positionAbbreviation,
            ),
          ),
        ),
      })),
      Option.map(Data.struct),
    ),
  )
  return Option.match(player, {
    onNone: () => Nothing,
    onSome: ({ active, name, position, rating }) =>
      Pressable({
        onPress: openPlayer(id),
        direction: 'row',
        align: 'center',
        gap: 8,
        round: 8,
        shadow: 1,
        bg: Colors.card,
      })([
        Checkbox({
          onToggle: togglePlayerActive(id),
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
            Option.match(position, {
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
      Option.match({
        onNone: constant<Array<Player>>([]),
        onSome: g => g.players,
      }),
      Array.filter(p => p.active),
      Array.length,
    ),
  )
  return SolidButton({
    onPress: openParameters,
    p: 16,
    round: 0,
    color: Colors.header,
    isEnabled: numSelected > 1,
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
