import {
  A,
  Boolean,
  Data,
  Eq,
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
  TxtContext,
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
import { PreRender } from 'src/components/derivative/PreRender'
import { SolidButton } from 'src/components/derivative/SolidButton'
import { memoized, memoizedConst, namedConst } from 'src/components/hyperscript'
import { GroupOrder, Player, Position, Rating } from 'src/datatypes'
import { AppEvent, appEvents } from 'src/events'
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
  return View({ flex: 1 })([
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
    ParametersModal,
    SortModal,
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
    Menu,
    DeleteGroupModal,
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
          label: t('Select all'),
          icon: MaterialCommunityIcons({ name: 'checkbox-multiple-outline' }),
        }),
        HeaderMenuButton({
          onPress: on.sort.open(),
          label: t('Sort'),
          icon: MaterialIcons({ name: 'sort' }),
        }),
        HeaderMenuButton({
          onPress: on.export(),
          label: t('Export group'),
          icon: MaterialCommunityIcons({ name: 'export' }),
        }),
        HeaderMenuButton({
          onPress: appEvents.groups.item.upsert.edit(),
          label: t('Edit group'),
          icon: MaterialIcons({ name: 'edit' }),
        }),
        HeaderMenuButton({
          onPress: on.delete.open(),
          label: t('Delete group'),
          icon: MaterialIcons({ name: 'delete-outline' }),
        }),
      ]),
  })
})

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

const SortModal = namedConst('SortModal')(() => {
  const modalSortGroup = useSelector(s => s.ui.modalSortGroup)
  const mainSort = useSelector(s => s.groupOrder[0])
  return Boolean.match(modalSortGroup, {
    onFalse: () => Nothing,
    onTrue: () =>
      CenterModal({ onClose: on.sort.close(), title: t('Sorting') })([
        View({ roundB: 8, overflow: 'hidden' })([
          FilterButton({
            name: t('Name'),
            onPress: on.sort.by.name(),
            state:
              mainSort._tag === 'name'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
          }),
          FilterButton({
            name: t('Position'),
            onPress: on.sort.by.position(),
            state:
              mainSort._tag === 'position'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
          }),
          FilterButton({
            name: t('Rating'),
            onPress: on.sort.by.rating(),
            state:
              mainSort._tag === 'rating'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
          }),
          FilterButton({
            name: t('Active'),
            onPress: on.sort.by.active(),
            state:
              mainSort._tag === 'active'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
          }),
          FilterButton({
            name: t('Date'),
            onPress: on.sort.by.date(),
            state:
              mainSort._tag === 'date'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
          }),
        ]),
      ]),
  })
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
            color: Colors.primary,
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
        title: t('Parameters'),
        m: 24,
      })([
        View({ p: 16 })([
          Row({ align: 'center' })([
            BorderlessButton({ onPress: on.parameters.teamsCount.decrement() })(
              [MaterialIcons({ name: 'remove' })],
            ),
            Txt({ p: 8, weight: 600 })(
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
              color: Colors.text.normal,
            })([
              Txt({ flex: 1 })(
                pipe(
                  parameters.teamsCountMethod,
                  Match.valueTags({
                    count: () => t('Number of teams'),
                    playersRequired: () =>
                      t('Fixed number of players per team'),
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
            onPress: on.parameters.position.toggle(),
            direction: 'row',
            align: 'center',
            p: 8,
            round: 8,
            bg: Colors.opacity(0)(Colors.white),
          })([
            Checkbox({
              onToggle: on.parameters.position.toggle(),
              isSelected: parameters.position,
            }),
            Txt({ ml: 8, size: 14 })(t('Consider positions')),
          ]),
          Pressable({
            onPress: on.parameters.rating.toggle(),
            direction: 'row',
            align: 'center',
            p: 8,
            round: 8,
            bg: Colors.opacity(0)(Colors.white),
          })([
            Checkbox({
              onToggle: on.parameters.rating.toggle(),
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
          GhostButton({ onPress: on.parameters.close() })([Txt()(t('Cancel'))]),
          SolidButton({ onPress: on.parameters.shuffle() })([
            Txt()(t('Generate teams')),
          ]),
        ]),
      ]),
  })
})

const DeleteGroupModal = namedConst('DeleteGroupModal')(() => {
  const group = useSelector(getSelectedGroup)
  const isOpen = useSelector(s => s.ui.modalDeleteGroup)
  return CenterModal({
    onClose: on.delete.close(),
    visible: isOpen && O.isSome(group),
    title: t('Delete group'),
  })([
    View({ p: 16 })(
      pipe(
        group,
        O.map(g =>
          TxtContext({ align: 'left' })([
            Txt()(`${t('Want to delete the group')} `),
            Txt({ weight: 600 })(g.name),
            Txt()(` ${t('and all its players?')}`),
          ]),
        ),
        A.fromOption,
      ),
    ),
    View({ borderWidthT: 1, borderColor: Colors.opacity(0.375)(Colors.gray) })(
      [],
    ),
    Row({ p: 16, gap: 8, justify: 'end' })([
      GhostButton({ onPress: on.delete.close(), color: Colors.error })([
        Txt()(t('Cancel')),
      ]),
      SolidButton({
        onPress: on.delete.submit(),
        color: Colors.error,
      })([Txt()(t('Delete'))]),
    ]),
  ])
})

// spell-checker:words horiz
