import { $, A, Eq, Match, O, Option, R, constant } from 'fp'
import {
  FlatList,
  Header,
  MaterialCommunityIcons,
  MaterialIcons,
  Modal,
  Nothing,
  Pressable,
  Row,
  Txt,
  View,
} from 'src/components'
import {
  deepEq,
  memoized,
  memoizedConst,
  shallowEq,
} from 'src/components/helpers'
import { Group, GroupOrder, Parameters, Player, Rating } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { AppEvent, appEvents } from 'src/events/index'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'

const on = appEvents.group

export const GroupView = memoized('GroupScreen')(
  Eq.struct({
    parameters: deepEq,
    group: O.getEquivalence(shallowEq),
    modalParameters: Eq.strict(),
    modalSortGroup: Eq.strict(),
    groupOrder: deepEq,
  }),
  ({
    parameters,
    group,
    modalParameters,
    modalSortGroup,
    groupOrder,
  }: {
    parameters: Parameters
    group: Option<Group>
    modalParameters: boolean
    modalSortGroup: Option<null>
    groupOrder: GroupOrder
  }) =>
    View({ flex: 1 })([
      GroupHeader,
      FlatList({
        data: $(
          group,
          O.map(g => g.players),
          O.getOrElse(() => []),
          A.sort(GroupOrder.toOrder(groupOrder)),
        ),
        keyExtractor: ({ id }) => id,
        renderItem: Item,
        ListEmptyComponent: View({ flex: 1, justify: 'center' })([
          Txt({ align: 'center', size: 16, color: Colors.gray.$3 })(
            'Nenhum jogador cadastrado',
          ),
        ]),
        contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
        initialNumToRender: 16,
      }),
      Pressable({
        onPress: on.parameters.open(),
        p: 16,
        bg: Colors.primary.$5,
        rippleColor: Colors.black,
        rippleOpacity: 0.5,
      })([
        Txt({ align: 'center', color: Colors.white })('Sortear'),
        Txt({ align: 'center', color: Colors.white, size: 12 })(
          $(
            group,
            O.match(constant<Array<Player>>([]), g => g.players),
            A.filter(p => p.active),
            A.length,
            n =>
              n === 0
                ? '(Nenhum jogador selecionado)'
                : n === 1
                ? '(1 jogador selecionado)'
                : '(' + n.toString() + ' jogadores selecionados)',
          ),
        ),
      ]),
      ...(modalParameters ? [ParametersModal({ parameters })] : []),
      $(
        modalSortGroup,
        O.match(
          () => Nothing,
          () => SortModal({ mainSort: groupOrder[0] }),
        ),
      ),
    ]),
)

const GroupHeader = memoizedConst('GroupHeader')(
  View({ bg: Colors.white })([
    Header({
      title: 'Grupo',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerLeft: Pressable({
        onPress: appEvents.back(),
        ml: 4,
        p: 8,
        borderless: true,
        foreground: true,
      })([
        MaterialIcons({
          name: 'arrow-back',
          color: Colors.text.light,
          size: 24,
        }),
      ]),
      headerRight: Row({ px: 4, gap: 4 })([
        Pressable({
          onPress: on.sort.open(),
          p: 8,
          borderless: true,
          foreground: true,
        })([
          MaterialIcons({ name: 'sort', color: Colors.text.light, size: 24 }),
        ]),
        Pressable({
          onPress: on.player.active.toggleAll(),
          p: 8,
          borderless: true,
          foreground: true,
        })([
          MaterialCommunityIcons({
            name: 'checkbox-multiple-outline',
            color: Colors.text.light,
            size: 24,
          }),
        ]),
        Pressable({
          onPress: on.player.new(),
          p: 8,
          borderless: true,
          foreground: true,
        })([
          MaterialIcons({ name: 'add', color: Colors.text.light, size: 24 }),
        ]),
      ]),
    }),
  ]),
)

const Item = memoized('GroupItem')(
  deepEq,
  ({ id, name, position, rating, active }: Player) =>
    Pressable({
      onPress: on.player.open(id),
      direction: 'row',
      align: 'center',
      gap: 8,
      round: 8,
      shadow: 1,
      bg: Colors.white,
    })([
      Pressable({
        onPress: on.player.active.toggle(id),
        borderless: true,
        p: 8,
        mr: -8,
        rippleColor: Colors.primary.$5,
        rippleOpacity: 0.15,
      })([
        active
          ? View({
              borderWidth: 2,
              round: 4,
              h: 28,
              w: 28,
              bg: Colors.primary.$5,
              borderColor: Colors.primary.$5,
            })([
              MaterialIcons({
                name: 'check',
                size: 24,
                color: Colors.white,
              }),
            ])
          : View({
              borderWidth: 2,
              round: 4,
              borderColor: Colors.gray.$3,
              h: 28,
              w: 28,
            })([]),
      ]),
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
          align: 'center',
          includeFontPadding: false,
          size: 18,
          weight: 600,
          color: Colors.text.dark,
        })(position),
      ]),
      Txt({ size: 18, weight: 600, color: Colors.text.dark })(
        Rating.Show.show(rating),
      ),
      Txt({ my: 8, color: Colors.text.dark, numberOfLines: 1 })(name),
    ]),
)

const SortModal = ({
  mainSort,
}: {
  mainSort: { _tag: GroupOrderType; reverse: boolean }
}) =>
  Modal({
    transparent: true,
    flex: 1,
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: on.sort.close(),
  })([
    Pressable({
      onPress: on.sort.close(),
      flex: 1,
      justify: 'center',
      bg: $(Colors.black, R.map(withOpacity(63))),
    })([
      Pressable({
        onPress: appEvents.doNothing(),
        bg: Colors.white,
        m: 48,
        round: 8,
        shadow: 2,
        rippleColor: Colors.black,
        rippleOpacity: 0,
      })([
        Row({ align: 'center', p: 8 })([
          Txt({
            m: 8,
            flex: 1,
            size: 16,
            weight: 600,
            color: Colors.text.dark,
          })('Ordenação'),
          Pressable({
            p: 8,
            round: 4,
            onPress: on.sort.close(),
          })([
            MaterialIcons({ name: 'close', size: 24, color: Colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        View({ roundB: 8, overflow: 'hidden' })([
          FilterButton({
            name: 'Nome',
            onPress: on.sort.by.name(),
            state: $(
              mainSort._tag === 'name'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
            ),
          }),
          FilterButton({
            name: 'Posição',
            onPress: on.sort.by.position(),
            state: $(
              mainSort._tag === 'position'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
            ),
          }),
          FilterButton({
            name: 'Habilidade',
            onPress: on.sort.by.rating(),
            state: $(
              mainSort._tag === 'rating'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
            ),
          }),
          FilterButton({
            name: 'Ativo',
            onPress: on.sort.by.active(),
            state: $(
              mainSort._tag === 'active'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
            ),
          }),
          FilterButton({
            name: 'Data',
            onPress: on.sort.by.date(),
            state: $(
              mainSort._tag === 'date'
                ? O.some({ reverse: mainSort.reverse })
                : O.none(),
            ),
          }),
        ]),
      ]),
    ]),
  ])

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
      $(
        props.state,
        O.match(
          () => Nothing,
          ({ reverse }) =>
            MaterialCommunityIcons({
              name: reverse ? 'sort-descending' : 'sort-ascending',
              size: 24,
              color: Colors.primary.$5,
            }),
        ),
      ),
    ]),
    Txt({ flex: 1 })(props.name),
  ])

const ParametersModal = ({ parameters }: { parameters: Parameters }) =>
  Modal({
    transparent: true,
    flex: 1,
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: on.parameters.close(),
  })([
    Pressable({
      onPress: on.parameters.close(),
      flex: 1,
      justify: 'center',
      bg: $(Colors.black, R.map(withOpacity(63))),
    })([
      Pressable({
        onPress: appEvents.doNothing(),
        bg: Colors.white,
        m: 24,
        round: 8,
        shadow: 2,
        rippleColor: Colors.black,
        rippleOpacity: 0,
      })([
        Row({ align: 'center', p: 8 })([
          Txt({
            m: 8,
            flex: 1,
            size: 16,
            weight: 600,
            color: Colors.text.dark,
          })('Parâmetros'),
          Pressable({
            p: 8,
            round: 4,
            onPress: on.parameters.close(),
          })([
            MaterialIcons({ name: 'close', size: 24, color: Colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        View({ p: 16 })([
          Row({ align: 'center' })([
            Pressable({
              onPress: on.parameters.teamsCount.decrement(),
              p: 12,
              borderless: true,
              rippleColor: Colors.primary.$5,
              rippleOpacity: 0.15,
            })([
              MaterialIcons({
                name: 'remove',
                size: 24,
                color: Colors.primary.$5,
              }),
            ]),
            Txt({ p: 8, weight: 600, color: Colors.text.dark })(
              $(
                parameters.teamsCountMethod,
                Match.valueTags({
                  count: () => parameters.teamsCount.toString(),
                  playersRequired: () => parameters.playersRequired.toString(),
                }),
              ),
            ),
            Pressable({
              onPress: on.parameters.teamsCount.increment(),
              p: 12,
              borderless: true,
              rippleColor: Colors.primary.$5,
              rippleOpacity: 0.15,
            })([
              MaterialIcons({
                name: 'add',
                size: 24,
                color: Colors.primary.$5,
              }),
            ]),
            Pressable({
              onPress: on.parameters.teamsCount.toggleType(),
              flex: 1,
              direction: 'row',
              align: 'center',
              round: 8,
              p: 4,
              pl: 8,
              gap: 4,
            })([
              Txt({ flex: 1, color: Colors.text.dark })(
                $(
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
          })([
            parameters.position
              ? View({
                  borderWidth: 2,
                  round: 4,
                  h: 28,
                  w: 28,
                  bg: Colors.primary.$5,
                  borderColor: Colors.primary.$5,
                })([
                  MaterialIcons({
                    name: 'check',
                    size: 24,
                    color: Colors.white,
                  }),
                ])
              : View({
                  borderWidth: 2,
                  round: 4,
                  borderColor: Colors.gray.$3,
                  h: 28,
                  w: 28,
                })([]),
            Txt({ ml: 8, size: 14 })('Considerar posições'),
          ]),
          Pressable({
            onPress: on.parameters.rating.toggle(),
            direction: 'row',
            align: 'center',
            p: 8,
            round: 8,
          })([
            parameters.rating
              ? View({
                  borderWidth: 2,
                  round: 4,
                  h: 28,
                  w: 28,
                  bg: Colors.primary.$5,
                  borderColor: Colors.primary.$5,
                })([
                  MaterialIcons({
                    name: 'check',
                    size: 24,
                    color: Colors.white,
                  }),
                ])
              : View({
                  borderWidth: 2,
                  round: 4,
                  borderColor: Colors.gray.$3,
                  h: 28,
                  w: 28,
                })([]),
            Txt({ ml: 8, size: 14 })('Considerar habilidade'),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        Row({ p: 16, justify: 'end' })([
          Row()([
            Pressable({
              onPress: on.parameters.close(),
              mr: 8,
              p: 12,
              round: 4,
              rippleColor: Colors.primary.$5,
              rippleOpacity: 0.15,
            })([Txt({ color: Colors.primary.$5 })('Cancelar')]),
            Pressable({
              onPress: on.parameters.shuffle(),
              p: 12,
              round: 4,
              bg: Colors.primary.$5,
              rippleColor: Colors.black,
              rippleOpacity: 0.5,
            })([Txt({ color: Colors.white })('Sortear')]),
          ]),
        ]),
      ]),
    ]),
  ])

// spell-checker:words horiz
