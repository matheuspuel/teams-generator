import { $, $f, Eq, O, Option, R, RIO, S } from 'fp'
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
  Pressable,
  Row,
  Txt,
  View,
} from 'src/components/hyperscript'
import { Group } from 'src/datatypes/Group'
import { Parameters } from 'src/datatypes/Parameters'
import { Player, RatingShow } from 'src/datatypes/Player'
import { RootState } from 'src/model'
import { execute, replaceSApp } from 'src/services/Store'
import { Colors } from 'src/services/Theme'
import {
  getPlayerFromActiveGroup,
  toggleAllPlayersActive,
  togglePlayerActive,
} from 'src/slices/groups'
import {
  decrementTeamsCount,
  incrementTeamsCount,
  togglePosition,
  toggleRating,
} from 'src/slices/parameters'
import {
  PlayerFormLens,
  blankPlayerForm,
  getPlayerFormFromData,
} from 'src/slices/playerForm'
import { generateResult } from 'src/slices/result'
import { goBack, navigate } from 'src/slices/routes'
import { UiLens } from 'src/slices/ui'
import { Id } from 'src/utils/Entity'
import { withOpacity } from 'src/utils/datatypes/Color'

const onOpenParametersModal = execute(
  replaceSApp(UiLens.at('modalParameters'))(true),
)

const onPressAddPlayer = $(
  navigate('Player'),
  RIO.chain(() =>
    $(
      replaceSApp(UiLens.at('selectedPlayerId'))(O.none),
      S.apFirst(replaceSApp(PlayerFormLens)(blankPlayerForm)),
      execute,
    ),
  ),
)

const onPressItem = (playerId: Id) =>
  $(
    navigate('Player'),
    RIO.chain(() =>
      $(
        getPlayerFromActiveGroup({ playerId }),
        S.chain(
          O.match(
            () => S.of<RootState, void>(undefined),
            $f(
              getPlayerFormFromData,
              replaceSApp(PlayerFormLens),
              S.apFirst(
                replaceSApp(UiLens.at('selectedPlayerId'))(O.some(playerId)),
              ),
            ),
          ),
        ),
        execute,
      ),
    ),
  )

const onTogglePlayerActive = (id: Id) =>
  execute(togglePlayerActive({ playerId: id }))

const onCloseParametersModal = execute(
  replaceSApp(UiLens.at('modalParameters'))(false),
)

const doNothing = RIO.of(undefined)

const onDecrementTeamsCount = execute(decrementTeamsCount)

const onIncrementTeamsCount = execute(incrementTeamsCount)

const onTogglePosition = execute(togglePosition)

const onToggleRating = execute(toggleRating)

const onShuffle = $(
  onCloseParametersModal,
  RIO.chain(() => generateResult),
  RIO.chain(() => navigate('Result')),
)

export const GroupView = memoized('GroupScreen')(
  Eq.struct({
    parameters: deepEq,
    group: O.getEq(shallowEq),
    modalParameters: Eq.eqStrict,
  }),
  ({
    parameters,
    group,
    modalParameters,
  }: {
    parameters: Parameters
    group: Option<Group>
    modalParameters: boolean
  }) =>
    View({ flex: 1 })([
      GroupHeader,
      FlatList({
        data: $(
          group,
          O.map(g => g.players),
          O.getOrElseW(() => []),
        ),
        keyExtractor: ({ id }) => id,
        renderItem: Item,
        initialNumToRender: 16,
        contentContainerStyle: { p: 8, gap: 8 },
      }),
      Pressable({
        onPress: onOpenParametersModal,
        p: 16,
        bg: Colors.primary.$5,
        rippleColor: Colors.black,
        rippleOpacity: 0.5,
      })([Txt({ align: 'center', color: Colors.white })('Sortear')]),
      ...(modalParameters ? [ParametersModal({ parameters })] : []),
    ]),
)

const GroupHeader = memoizedConst('GroupHeader')(
  View({ bg: Colors.white })([
    Header({
      title: 'Grupo',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerLeft: Pressable({
        onPress: goBack,
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
      headerRight: Row()([
        Pressable({
          onPress: toggleAllPlayersActive,
          mr: 4,
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
          onPress: onPressAddPlayer,
          mr: 4,
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
      onPress: onPressItem(id),
      direction: 'row',
      align: 'center',
      gap: 8,
      round: 8,
      shadow: 1,
      bg: Colors.white,
    })([
      Pressable({
        onPress: onTogglePlayerActive(id),
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
        RatingShow.show(rating),
      ),
      Txt({ my: 8, color: Colors.text.dark, numberOfLines: 1 })(name),
    ]),
)

const ParametersModal = ({ parameters }: { parameters: Parameters }) =>
  Modal({
    transparent: true,
    flex: 1,
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: onCloseParametersModal,
  })([
    Pressable({
      onPress: onCloseParametersModal,
      flex: 1,
      justify: 'center',
      bg: $(Colors.black, R.map(withOpacity(63))),
    })([
      Pressable({
        onPress: doNothing,
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
            onPress: onCloseParametersModal,
          })([
            MaterialIcons({ name: 'close', size: 24, color: Colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        View({ p: 16 })([
          Row({ align: 'center' })([
            Pressable({
              onPress: onDecrementTeamsCount,
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
              parameters.teamsCount.toString(),
            ),
            Pressable({
              onPress: onIncrementTeamsCount,
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
            Txt({ flex: 1, pl: 8, color: Colors.text.dark })('Número de times'),
          ]),
          Pressable({
            onPress: onTogglePosition,
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
            onPress: onToggleRating,
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
              onPress: onCloseParametersModal,
              mr: 8,
              p: 12,
              round: 4,
              rippleColor: Colors.primary.$5,
              rippleOpacity: 0.15,
            })([Txt({ color: Colors.primary.$5 })('Cancelar')]),
            Pressable({
              onPress: onShuffle,
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
