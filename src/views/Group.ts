import { $, Eq, O, Option, R, RA, constant } from 'fp'
import { AppEvent, on } from 'src/actions'
import {
  deepEq,
  memoized,
  memoizedConst,
  shallowEq,
} from 'src/components/helpers'
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
} from 'src/components/hyperscript'
import { Group, GroupOrder, Parameters, Player, Rating } from 'src/datatypes'
import { GroupOrderType } from 'src/datatypes/GroupOrder'
import { Colors } from 'src/services/Theme'
import { matchTag } from 'src/utils/Tagged'
import { withOpacity } from 'src/utils/datatypes/Color'

export const GroupView = memoized('GroupScreen')(
  Eq.struct({
    parameters: deepEq,
    group: O.getEq(shallowEq),
    modalParameters: Eq.eqStrict,
    modalSortGroup: Eq.eqStrict,
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
          O.getOrElseW(() => []),
          RA.sort(GroupOrder.toOrd(groupOrder)),
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
        onPress: on.openParametersModal,
        p: 16,
        bg: Colors.primary.$5,
        rippleColor: Colors.black,
        rippleOpacity: 0.5,
      })([
        Txt({ align: 'center', color: Colors.white })('Sortear'),
        Txt({ align: 'center', color: Colors.white, size: 12 })(
          $(
            group,
            O.match(constant([]), g => g.players),
            RA.filter(p => p.active),
            RA.size,
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
        O.matchW(
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
        onPress: on.goBack,
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
          onPress: on.openSortGroupModal,
          p: 8,
          borderless: true,
          foreground: true,
        })([
          MaterialIcons({ name: 'sort', color: Colors.text.light, size: 24 }),
        ]),
        Pressable({
          onPress: on.toggleAllPlayersActive,
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
          onPress: on.pressNewPlayer,
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
      onPress: on.selectPlayer(id),
      direction: 'row',
      align: 'center',
      gap: 8,
      round: 8,
      shadow: 1,
      bg: Colors.white,
    })([
      Pressable({
        onPress: on.togglePlayerActive(id),
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
    onRequestClose: on.closeSortGroupModal,
  })([
    Pressable({
      onPress: on.closeSortGroupModal,
      flex: 1,
      justify: 'center',
      bg: $(Colors.black, R.map(withOpacity(63))),
    })([
      Pressable({
        onPress: on.doNothing,
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
            onPress: on.closeSortGroupModal,
          })([
            MaterialIcons({ name: 'close', size: 24, color: Colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        View({ roundB: 8, overflow: 'hidden' })([
          FilterButton({
            name: 'Nome',
            onPress: on.groupSortByName,
            state: $(
              mainSort._tag === 'name'
                ? O.some({ reverse: mainSort.reverse })
                : O.none,
            ),
          }),
          FilterButton({
            name: 'Posição',
            onPress: on.groupSortByPosition,
            state: $(
              mainSort._tag === 'position'
                ? O.some({ reverse: mainSort.reverse })
                : O.none,
            ),
          }),
          FilterButton({
            name: 'Habilidade',
            onPress: on.groupSortByRating,
            state: $(
              mainSort._tag === 'rating'
                ? O.some({ reverse: mainSort.reverse })
                : O.none,
            ),
          }),
          FilterButton({
            name: 'Ativo',
            onPress: on.groupSortByActive,
            state: $(
              mainSort._tag === 'active'
                ? O.some({ reverse: mainSort.reverse })
                : O.none,
            ),
          }),
          FilterButton({
            name: 'Data',
            onPress: on.groupSortByDate,
            state: $(
              mainSort._tag === 'date'
                ? O.some({ reverse: mainSort.reverse })
                : O.none,
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
        O.matchW(
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
    onRequestClose: on.closeParametersModal,
  })([
    Pressable({
      onPress: on.closeParametersModal,
      flex: 1,
      justify: 'center',
      bg: $(Colors.black, R.map(withOpacity(63))),
    })([
      Pressable({
        onPress: on.doNothing,
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
          })('Parâmetros'),
          Pressable({
            p: 8,
            round: 4,
            onPress: on.closeParametersModal,
          })([
            MaterialIcons({ name: 'close', size: 24, color: Colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        View({ p: 16 })([
          Row({ align: 'center' })([
            Pressable({
              onPress: on.decrementTeamsCount,
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
                matchTag({
                  count: () => parameters.teamsCount.toString(),
                  playersRequired: () => parameters.playersRequired.toString(),
                }),
              ),
            ),
            Pressable({
              onPress: on.incrementTeamsCount,
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
            Pressable({ onPress: on.toggleTeamsCountType })([
              Txt({ flex: 1, pl: 8, color: Colors.text.dark })(
                $(
                  parameters.teamsCountMethod,
                  matchTag({
                    count: () => 'Número de times',
                    playersRequired: () =>
                      'Número necessário de jogadores por time',
                  }),
                ),
              ),
              MaterialIcons({
                name: 'swap-horiz',
                color: Colors.primary.$5,
                size: 24,
              }),
            ]),
          ]),
          Pressable({
            onPress: on.togglePosition,
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
            onPress: on.toggleRating,
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
              onPress: on.closeParametersModal,
              mr: 8,
              p: 12,
              round: 4,
              rippleColor: Colors.primary.$5,
              rippleOpacity: 0.15,
            })([Txt({ color: Colors.primary.$5 })('Cancelar')]),
            Pressable({
              onPress: on.shuffle,
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
