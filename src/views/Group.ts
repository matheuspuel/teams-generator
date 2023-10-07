import {
  A,
  Boolean,
  Data,
  Eq,
  F,
  Match,
  O,
  Option,
  constant,
  flow,
  pipe,
} from 'fp'
import {
  FlatList,
  Header,
  MaterialCommunityIcons,
  MaterialIcons,
  Nothing,
  Pressable,
  Row,
  Txt,
  View,
} from 'src/components'
import { BorderlessButton } from 'src/components/derivative/BorderlessButton'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { Checkbox } from 'src/components/derivative/Checkbox'
import { GhostButton } from 'src/components/derivative/GhostButton'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { HeaderMenu } from 'src/components/derivative/HeaderMenu'
import { HeaderMenuButton } from 'src/components/derivative/HeaderMenuButton'
import { PreRender } from 'src/components/derivative/PreRender2'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoized, memoizedConst, namedConst } from 'src/components/hyperscript'
import { GroupOrder, Player, Rating } from 'src/datatypes'
import { AppEvent, appEvents } from 'src/events'
import { useSelector } from 'src/hooks/useSelector'
import { RootState } from 'src/model'
import { Colors } from 'src/services/Theme'
import { getGroupById } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { withOpacity } from 'src/utils/datatypes/Color'

const on = appEvents.group

const getSelectedGroup = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    O.flatMap(id => getGroupById(id)(s)),
  )

export const GroupView = memoizedConst('GroupView')(() => {
  const playersIds = useSelector(s =>
    pipe(
      getSelectedGroup(s),
      O.map(g => g.players),
      O.getOrElse(() => []),
      A.sort(GroupOrder.toOrder(s.groupOrder)),
      A.map(p => p.id),
      Data.array,
    ),
  )
  return View({ flex: 1 })([
    GroupHeader,
    PreRender(
      View({ flex: 1, p: 8, gap: 8 })(
        A.replicate(3)(
          View({ round: 8, shadow: 1, bg: Colors.gray.$1, h: 40 })([]),
        ),
      ),
    )(
      FlatList({
        data: playersIds,
        keyExtractor: id => id,
        renderItem: Item,
        ListEmptyComponent: View({ flex: 1, justify: 'center' })([
          Txt({ size: 16, color: Colors.gray.$3 })('Nenhum jogador cadastrado'),
        ]),
        contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
        initialNumToRender: 16,
      }),
    ),
    ShuffleButton,
    ParametersModal,
    SortModal,
  ])
})

const GroupHeader = memoizedConst('GroupHeader')(() =>
  View({ bg: Colors.white })([
    Header({
      title: 'Grupo',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
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
    Menu,
  ]),
)

const Menu = namedConst('GroupMenu')(() => {
  const menu = useSelector(s => s.ui.groupMenu)
  return Boolean.match(menu, {
    onFalse: () => Nothing,
    onTrue: () =>
      HeaderMenu({ onClose: on.menu.close() })([
        HeaderMenuButton({
          onPress: on.player.active.toggleAll(),
          label: 'Selecionar todos',
          icon: MaterialCommunityIcons({ name: 'checkbox-multiple-outline' }),
        }),
        HeaderMenuButton({
          onPress: on.sort.open(),
          label: 'Ordenar',
          icon: MaterialIcons({ name: 'sort' }),
        }),
        HeaderMenuButton({
          onPress: on.export(),
          label: 'Exportar grupo',
          icon: MaterialCommunityIcons({ name: 'export' }),
        }),
      ]),
  })
})

const Item = memoized('Player')((id: Id) => {
  const player = useSelector(
    flow(
      getSelectedGroup,
      O.map(g => g.players),
      O.flatMap(A.findFirst(p => p.id === id)),
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
        bg: Colors.white,
      })([
        Checkbox({
          onToggle: on.player.active.toggle(id),
          isSelected: active,
          m: 8,
          mr: -8,
        }),
        View({
          aspectRatio: 1,
          alignSelf: 'stretch',
          justify: 'center',
          p: 4,
          my: 4,
          round: 9999,
          bg: Colors.yellow.$3,
        })([
          Txt({
            includeFontPadding: false,
            size: 18,
            weight: 600,
            color: Colors.text.dark,
          })(position),
        ]),
        Txt({ size: 18, weight: 600, color: Colors.text.dark })(
          Rating.toString(rating),
        ),
        Txt({ my: 8, color: Colors.text.dark, numberOfLines: 1 })(name),
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
  })([
    Txt()('Sortear'),
    Txt({ size: 12 })(
      pipe(numSelected, n =>
        n === 0
          ? '(Nenhum jogador selecionado)'
          : n === 1
          ? '(1 jogador selecionado)'
          : '(' + n.toString() + ' jogadores selecionados)',
      ),
    ),
  ])
})

const SortModal = namedConst('SortModal')(() => {
  const modalSortGroup = useSelector(s => s.ui.modalSortGroup)
  const mainSort = useSelector(s => s.groupOrder[0])
  return pipe(
    modalSortGroup,
    O.match({
      onNone: () => Nothing,
      onSome: () =>
        CenterModal({ onClose: on.sort.close(), title: 'Ordenação' })([
          View({ roundB: 8, overflow: 'hidden' })([
            FilterButton({
              name: 'Nome',
              onPress: on.sort.by.name(),
              state:
                mainSort._tag === 'name'
                  ? O.some({ reverse: mainSort.reverse })
                  : O.none(),
            }),
            FilterButton({
              name: 'Posição',
              onPress: on.sort.by.position(),
              state:
                mainSort._tag === 'position'
                  ? O.some({ reverse: mainSort.reverse })
                  : O.none(),
            }),
            FilterButton({
              name: 'Habilidade',
              onPress: on.sort.by.rating(),
              state:
                mainSort._tag === 'rating'
                  ? O.some({ reverse: mainSort.reverse })
                  : O.none(),
            }),
            FilterButton({
              name: 'Ativo',
              onPress: on.sort.by.active(),
              state:
                mainSort._tag === 'active'
                  ? O.some({ reverse: mainSort.reverse })
                  : O.none(),
            }),
            FilterButton({
              name: 'Data',
              onPress: on.sort.by.date(),
              state:
                mainSort._tag === 'date'
                  ? O.some({ reverse: mainSort.reverse })
                  : O.none(),
            }),
          ]),
        ]),
    }),
  )
})

const FilterButton = (props: {
  state: Option<{ reverse: boolean }>
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
      O.match(props.state, {
        onNone: () => Nothing,
        onSome: ({ reverse }) =>
          MaterialCommunityIcons({
            name: reverse ? 'sort-descending' : 'sort-ascending',
            color: Colors.primary.$5,
          }),
      }),
    ]),
    Txt({ flex: 1, align: 'left' })(props.name),
  ])

const ParametersModal = namedConst('ParametersModal')(() => {
  const modalParameters = useSelector(s => s.ui.modalParameters)
  const parameters = useSelector(s => s.parameters, Eq.deep())
  return Boolean.match(modalParameters, {
    onFalse: () => Nothing,
    onTrue: () =>
      CenterModal({
        onClose: on.parameters.close(),
        title: 'Parâmetros',
        m: 24,
      })([
        View({ p: 16 })([
          Row({ align: 'center' })([
            BorderlessButton({ onPress: on.parameters.teamsCount.decrement() })(
              [MaterialIcons({ name: 'remove' })],
            ),
            Txt({ p: 8, weight: 600, color: Colors.text.dark })(
              pipe(
                parameters.teamsCountMethod,
                Match.valueTags({
                  count: () => parameters.teamsCount.toString(),
                  playersRequired: () => parameters.playersRequired.toString(),
                }),
              ),
            ),
            BorderlessButton({ onPress: on.parameters.teamsCount.increment() })(
              [MaterialIcons({ name: 'add' })],
            ),
            GhostButton({
              onPress: on.parameters.teamsCount.toggleType(),
              flex: 1,
              direction: 'row',
              align: 'center',
              p: 4,
              pl: 8,
              gap: 4,
              color: Colors.text.dark,
            })([
              Txt({ flex: 1 })(
                pipe(
                  parameters.teamsCountMethod,
                  Match.valueTags({
                    count: () => 'Número de times',
                    playersRequired: () => 'Número fixo de jogadores por time',
                  }),
                ),
              ),
              MaterialIcons({
                name: 'swap-horiz',
                size: 20,
                color: Colors.primary.$5,
              }),
            ]),
          ]),
          Pressable({
            onPress: on.parameters.position.toggle(),
            direction: 'row',
            align: 'center',
            p: 8,
            round: 8,
            bg: F.map(Colors.white, withOpacity(0)),
          })([
            Checkbox({
              onToggle: on.parameters.position.toggle(),
              isSelected: parameters.position,
            }),
            Txt({ ml: 8, size: 14 })('Considerar posições'),
          ]),
          Pressable({
            onPress: on.parameters.rating.toggle(),
            direction: 'row',
            align: 'center',
            p: 8,
            round: 8,
            bg: F.map(Colors.white, withOpacity(0)),
          })([
            Checkbox({
              onToggle: on.parameters.rating.toggle(),
              isSelected: parameters.rating,
            }),
            Txt({ ml: 8, size: 14 })('Considerar habilidade'),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        Row({ p: 16, gap: 8, justify: 'end' })([
          GhostButton({ onPress: on.parameters.close() })([Txt()('Cancelar')]),
          SolidButton({ onPress: on.parameters.shuffle() })([Txt()('Sortear')]),
        ]),
      ]),
  })
})

// spell-checker:words horiz
