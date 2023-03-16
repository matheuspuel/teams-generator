import { $, $f, Eq, O, Option, RIO, S } from 'fp'
import {
  deepEq,
  memoized,
  memoizedConst,
  shallowEq,
} from 'src/components/helpers'
import { FlatList } from 'src/components/safe/basic/FlatList'
import { Modal } from 'src/components/safe/basic/Modal'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { Txt } from 'src/components/util-props/basic/Txt'
import { View } from 'src/components/util-props/basic/View'
import { MaterialCommunityIcons } from 'src/components/util-props/icons/MaterialCommunityIcons'
import { MaterialIcons } from 'src/components/util-props/icons/MaterialIcons'
import { Header } from 'src/components/util-props/react-navigation/Header'
import { HeaderBackButton } from 'src/components/util-props/react-navigation/HeaderBackButton'
import { Group } from 'src/datatypes/Group'
import { Parameters } from 'src/datatypes/Parameters'
import { Player, RatingShow } from 'src/datatypes/Player'
import { RootState } from 'src/model'
import { execute, replaceSApp } from 'src/services/Store'
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
  blankPlayerForm,
  getPlayerFormFromData,
  PlayerFormLens,
} from 'src/slices/playerForm'
import { generateResult } from 'src/slices/result'
import { goBack, navigate } from 'src/slices/routes'
import { UiLens } from 'src/slices/ui'
import { colors } from 'src/theme'
import { Color } from 'src/utils/datatypes'
import { Id } from 'src/utils/Entity'

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
        initialNumToRender: 20,
      }),
      Pressable({
        p: 12,
        bg: colors.primary.$5,
        pressed: { bg: Color.shade(0.4)(colors.primary.$5) },
        onPress: onOpenParametersModal,
      })([Txt({ align: 'center', color: colors.white })('Sortear')]),
      ...(modalParameters ? [ParametersModal({ parameters })] : []),
    ]),
)

const GroupHeader = memoizedConst('GroupHeader')(
  View({ bg: colors.white })([
    Header({
      title: 'Grupo',
      headerStyle: { backgroundColor: colors.primary.$5 },
      headerTitleStyle: { color: colors.lightText },
      headerLeft: HeaderBackButton({
        onPress: goBack,
        tintColor: colors.lightText,
      }),
      headerRight: Row()([
        Pressable({
          mr: 4,
          p: 8,
          round: 100,
          pressed: { bg: Color.withOpacity(47)(colors.black) },
          onPress: toggleAllPlayersActive,
        })([
          MaterialCommunityIcons({
            name: 'checkbox-multiple-outline',
            color: colors.lightText,
            size: 24,
          }),
        ]),
        Pressable({
          mr: 4,
          p: 8,
          round: 100,
          pressed: { bg: Color.withOpacity(47)(colors.black) },
          onPress: onPressAddPlayer,
        })([MaterialIcons({ name: 'add', color: colors.lightText, size: 24 })]),
      ]),
    }),
  ]),
)

const Item = memoized('GroupItem')(
  deepEq,
  ({ id, name, position, rating, active }: Player) =>
    Pressable({ onPress: onPressItem(id) })([
      Row({
        align: 'center',
        bg: colors.white,
        m: 4,
        p: 4,
        round: 8,
        shadow: 1,
      })([
        Pressable({ mr: 8, onPress: onTogglePlayerActive(id) })(
          ({ pressed }) => [
            active
              ? View({
                  borderWidth: 2,
                  round: 4,
                  h: 28,
                  w: 28,
                  bg: colors.primary[pressed ? '$7' : '$5'],
                  borderColor: colors.primary[pressed ? '$7' : '$5'],
                })([
                  MaterialIcons({
                    name: 'check',
                    size: 24,
                    color: colors.white,
                  }),
                ])
              : View({
                  borderWidth: 2,
                  round: 4,
                  borderColor: colors.gray[pressed ? '$5' : '$3'],
                  h: 28,
                  w: 28,
                })([]),
          ],
        ),
        View({
          aspectRatio: 1,
          alignSelf: 'stretch',
          justify: 'center',
          align: 'center',
          p: 4,
          round: 9999,
          bg: colors.yellow.$3,
        })([
          Txt({
            size: 16,
            weight: 600,
            color: colors.darkText,
            lineHeight: 19,
          })(position),
        ]),
        Txt({ mx: 8, weight: 600, color: colors.darkText })(
          RatingShow.show(rating),
        ),
        Txt({ color: colors.darkText, numberOfLines: 1 })(name),
      ]),
    ]),
)

const ParametersModal = ({ parameters }: { parameters: Parameters }) =>
  Modal({
    transparent: true,
    style: { flex: 1 },
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: onCloseParametersModal,
  })([
    Pressable({
      flex: 1,
      bg: Color.withOpacity(63)(colors.black),
      justify: 'center',
      onPress: onCloseParametersModal,
    })([
      Pressable({
        bg: colors.white,
        m: 48,
        round: 8,
        shadow: 2,
        onPress: doNothing,
      })([
        Row({ align: 'center', p: 8 })([
          Txt({
            m: 8,
            flex: 1,
            size: 16,
            weight: 600,
            color: colors.darkText,
          })('Parâmetros'),
          Pressable({
            p: 8,
            round: 4,
            pressed: { bg: Color.withOpacity(31)(colors.gray.$5) },
            onPress: onCloseParametersModal,
          })([
            MaterialIcons({ name: 'close', size: 24, color: colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: colors.gray.$2 })([]),
        View({ p: 16 })([
          Row({ align: 'center' })([
            Pressable({
              p: 12,
              round: 4,
              pressed: { bg: Color.withOpacity(31)(colors.primary.$5) },
              onPress: onDecrementTeamsCount,
            })([
              MaterialIcons({
                name: 'remove',
                size: 24,
                color: colors.primary.$5,
              }),
            ]),
            Txt({ p: 8, weight: 600, color: colors.darkText })(
              parameters.teamsCount.toString(),
            ),
            Pressable({
              p: 12,
              pressed: { bg: Color.withOpacity(31)(colors.primary.$5) },
              round: 4,
              onPress: onIncrementTeamsCount,
            })([
              MaterialIcons({
                name: 'add',
                size: 24,
                color: colors.primary.$5,
              }),
            ]),
            Txt({ flex: 1, pl: 8, color: colors.darkText })('Número de times'),
          ]),
          Pressable({ p: 4, onPress: onTogglePosition })(({ pressed }) => [
            Row({ align: 'center' })([
              parameters.position
                ? View({
                    borderWidth: 2,
                    round: 4,
                    h: 28,
                    w: 28,
                    bg: colors.primary[pressed ? '$7' : '$5'],
                    borderColor: colors.primary[pressed ? '$7' : '$5'],
                  })([
                    MaterialIcons({
                      name: 'check',
                      size: 24,
                      color: colors.white,
                    }),
                  ])
                : View({
                    borderWidth: 2,
                    round: 4,
                    borderColor: colors.gray[pressed ? '$5' : '$3'],
                    h: 28,
                    w: 28,
                  })([]),
              Txt({ m: 4, size: 14 })('Considerar posições'),
            ]),
          ]),
          Pressable({ p: 4, onPress: onToggleRating })(({ pressed }) => [
            Row({ align: 'center' })([
              parameters.rating
                ? View({
                    borderWidth: 2,
                    round: 4,
                    h: 28,
                    w: 28,
                    bg: colors.primary[pressed ? '$7' : '$5'],
                    borderColor: colors.primary[pressed ? '$7' : '$5'],
                  })([
                    MaterialIcons({
                      name: 'check',
                      size: 24,
                      color: colors.white,
                    }),
                  ])
                : View({
                    borderWidth: 2,
                    round: 4,
                    borderColor: colors.gray[pressed ? '$5' : '$3'],
                    h: 28,
                    w: 28,
                  })([]),
              Txt({ m: 4, size: 14 })('Considerar habilidade'),
            ]),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: colors.gray.$2 })([]),
        Row({ p: 16, justify: 'end' })([
          Row()([
            Pressable({
              mr: 8,
              p: 12,
              round: 4,
              pressed: { bg: Color.withOpacity(31)(colors.primary.$5) },
              onPress: onCloseParametersModal,
            })([Txt({ color: colors.primary.$5 })('Cancelar')]),
            Pressable({
              p: 12,
              round: 4,
              bg: colors.primary.$5,
              pressed: { bg: Color.shade(0.4)(colors.primary.$5) },
              onPress: onShuffle,
            })([Txt({ color: colors.white })('Sortear')]),
          ]),
        ]),
      ]),
    ]),
  ])
