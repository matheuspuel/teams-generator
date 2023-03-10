import { $, $f, A, constVoid, O, Option, RIO, S } from 'fp'
import { Txt } from 'src/components/hyperscript/derivative'
import {
  MaterialCommunityIcons,
  MaterialIcons,
} from 'src/components/hyperscript/icons'
import { FlatList } from 'src/components/safe/basic/FlatList'
import { Modal } from 'src/components/safe/basic/Modal'
import { Header } from 'src/components/safe/react-navigation/Header'
import { HeaderBackButton } from 'src/components/safe/react-navigation/HeaderBackButton'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { View } from 'src/components/util-props/basic/View'
import { Group } from 'src/datatypes/Group'
import { Parameters } from 'src/datatypes/Parameters'
import { Player, PlayerIsActive, RatingShow } from 'src/datatypes/Player'
import { execute, replaceSApp } from 'src/redux'
import {
  getPlayer,
  setAllPlayersActive,
  togglePlayerActive,
} from 'src/redux/slices/groups'
import {
  decrementTeamsCount,
  incrementTeamsCount,
  togglePosition,
  toggleRating,
} from 'src/redux/slices/parameters'
import {
  blankPlayerForm,
  getPlayerFormFromData,
  PlayerFormLens,
} from 'src/redux/slices/playerForm'
import { generateResult } from 'src/redux/slices/result'
import { goBack, navigate } from 'src/redux/slices/routes'
import { UiLens } from 'src/redux/slices/ui'
import { RootState } from 'src/redux/store'
import { theme } from 'src/theme'
import { Id } from 'src/utils/Entity'

export const GroupView = ({
  parameters,
  groupId,
  group,
  modalParameters,
}: {
  parameters: Parameters
  groupId: Option<Id>
  group: Option<Group>
  modalParameters: boolean
}) => {
  const players: Array<Player> = $(
    group,
    O.map(g => g.players),
    O.getOrElseW(() => []),
  )
  return View({ flex: 1 })([
    View({ bg: theme.colors.white })([
      Header({
        title: 'Grupo',
        headerStyle: { backgroundColor: theme.colors.primary[600] },
        headerTitleStyle: { color: theme.colors.lightText },
        headerLeft: HeaderBackButton({
          onPress: goBack,
          tintColor: theme.colors.lightText,
        }),
        headerRight: Row()([
          Pressable({
            mr: 4,
            p: 8,
            round: 100,
            pressed: { bg: theme.colors.primary[700] },
            onPress: $(
              groupId,
              O.match(
                () => () => constVoid,
                id =>
                  execute(
                    setAllPlayersActive({
                      groupId: id,
                      active: !$(players, A.every(PlayerIsActive)),
                    }),
                  ),
              ),
            ),
          })([
            MaterialCommunityIcons({
              name: 'checkbox-multiple-outline',
              color: theme.colors.lightText,
              size: 24,
            }),
          ]),
          Pressable({
            mr: 4,
            p: 8,
            round: 100,
            pressed: { bg: theme.colors.primary[700] },
            onPress: $(
              navigate('Player'),
              RIO.chain(() =>
                $(
                  replaceSApp(UiLens.at('selectedPlayerId'))(O.none),
                  S.apFirst(replaceSApp(PlayerFormLens)(blankPlayerForm)),
                  execute,
                ),
              ),
            ),
          })([
            MaterialIcons({
              name: 'add',
              color: theme.colors.lightText,
              size: 24,
            }),
          ]),
        ]),
      }),
    ]),
    ...$(
      groupId,
      O.map(groupId =>
        FlatList({
          data: players,
          keyExtractor: ({ id }) => id,
          renderItem: item => Item({ data: item, groupId }),
          initialNumToRender: 20,
        }),
      ),
      A.fromOption,
    ),
    Pressable({
      p: 12,
      bg: theme.colors.primary[600],
      pressed: { bg: theme.colors.primary[800] },
      onPress: execute(replaceSApp(UiLens.at('modalParameters'))(true)),
    })([
      Txt({ style: { textAlign: 'center', color: theme.colors.white } })(
        'Sortear',
      ),
    ]),
    ...(modalParameters ? [ParametersModal({ parameters })] : []),
  ])
}

const Item = ({
  data: { id, name, position, rating, active },
  groupId,
}: {
  data: Player
  groupId: Id
}) =>
  Pressable({
    onPress: $(
      navigate('Player'),
      RIO.chain(() =>
        $(
          S.gets(getPlayer({ groupId, id })),
          S.chain(
            O.match(
              () => S.of<RootState, void>(undefined),
              $f(
                getPlayerFormFromData,
                replaceSApp(PlayerFormLens),
                S.apFirst(
                  replaceSApp(UiLens.at('selectedPlayerId'))(O.some(id)),
                ),
              ),
            ),
          ),
          execute,
        ),
      ),
    ),
  })([
    Row({
      align: 'center',
      bg: theme.colors.white,
      m: 4,
      p: 4,
      round: 8,
      shadow: 1,
    })([
      Pressable({
        mr: 8,
        onPress: execute(togglePlayerActive({ groupId, playerId: id })),
      })(({ pressed }) => [
        active
          ? View({
              borderWidth: 2,
              round: 4,
              h: 28,
              w: 28,
              bg: theme.colors.primary[pressed ? 800 : 600],
              borderColor: theme.colors.primary[pressed ? 800 : 600],
            })([
              MaterialIcons({
                name: 'check',
                size: 24,
                color: theme.colors.white,
              }),
            ])
          : View({
              borderWidth: 2,
              round: 4,
              borderColor: theme.colors.gray[pressed ? 600 : 400],
              h: 28,
              w: 28,
            })([]),
      ]),
      View({
        aspectRatio: 1,
        alignSelf: 'stretch',
        justify: 'center',
        align: 'center',
        p: 4,
        round: 9999,
        bg: theme.colors.amber[300],
      })([
        Txt({
          style: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.darkText,
            lineHeight: 19,
          },
        })(position),
      ]),
      Txt({
        style: {
          marginHorizontal: 8,
          fontWeight: 'bold',
          color: theme.colors.darkText,
        },
      })(RatingShow.show(rating)),
      Txt({ style: { color: theme.colors.darkText }, numberOfLines: 1 })(name),
    ]),
  ])

const ParametersModal = ({ parameters }: { parameters: Parameters }) =>
  Modal({
    transparent: true,
    style: { flex: 1 },
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: execute(replaceSApp(UiLens.at('modalParameters'))(false)),
  })([
    Pressable({
      flex: 1,
      bg: theme.colors.black + '3f',
      justify: 'center',
      onPress: execute(replaceSApp(UiLens.at('modalParameters'))(false)),
    })([
      Pressable({
        bg: theme.colors.white,
        m: 48,
        round: 8,
        shadow: 2,
        onPress: () => constVoid,
      })([
        Row({ align: 'center', p: 8 })([
          Txt({
            style: {
              margin: 8,
              flex: 1,
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.darkText,
            },
          })('Parâmetros'),
          Pressable({
            p: 8,
            round: 4,
            pressed: { bg: theme.colors.gray[600] + '1f' },
            onPress: execute(replaceSApp(UiLens.at('modalParameters'))(false)),
          })([
            MaterialIcons({
              name: 'close',
              size: 24,
              color: theme.colors.gray[500],
            }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: theme.colors.gray[300] })([]),
        View({ p: 16 })([
          Row({ align: 'center' })([
            Pressable({
              p: 12,
              round: 4,
              pressed: { bg: theme.colors.primary[600] + '1f' },
              onPress: execute(decrementTeamsCount),
            })([
              MaterialIcons({
                name: 'remove',
                size: 24,
                color: theme.colors.primary[600],
              }),
            ]),
            Txt({
              style: {
                padding: 8,
                fontWeight: 'bold',
                color: theme.colors.darkText,
              },
            })(parameters.teamsCount.toString()),
            Pressable({
              p: 12,
              pressed: { bg: theme.colors.primary[600] + '1f' },
              round: 4,
              onPress: execute(incrementTeamsCount),
            })([
              MaterialIcons({
                name: 'add',
                size: 24,
                color: theme.colors.primary[600],
              }),
            ]),
            Txt({
              style: {
                flex: 1,
                paddingLeft: 8,
                color: theme.colors.darkText,
              },
            })('Número de times'),
          ]),
          Pressable({ p: 4, onPress: execute(togglePosition) })(
            ({ pressed }) => [
              Row({ align: 'center' })([
                parameters.position
                  ? View({
                      borderWidth: 2,
                      round: 4,
                      h: 28,
                      w: 28,
                      bg: theme.colors.primary[pressed ? 800 : 600],
                      borderColor: theme.colors.primary[pressed ? 800 : 600],
                    })([
                      MaterialIcons({
                        name: 'check',
                        size: 24,
                        color: theme.colors.white,
                      }),
                    ])
                  : View({
                      borderWidth: 2,
                      round: 4,
                      borderColor: theme.colors.gray[pressed ? 600 : 400],
                      h: 28,
                      w: 28,
                    })([]),
                Txt({ style: { margin: 4, fontSize: 14 } })(
                  'Considerar posições',
                ),
              ]),
            ],
          ),
          Pressable({ p: 4, onPress: execute(toggleRating) })(({ pressed }) => [
            Row({ align: 'center' })([
              parameters.rating
                ? View({
                    borderWidth: 2,
                    round: 4,
                    h: 28,
                    w: 28,
                    bg: theme.colors.primary[pressed ? 800 : 600],
                    borderColor: theme.colors.primary[pressed ? 800 : 600],
                  })([
                    MaterialIcons({
                      name: 'check',
                      size: 24,
                      color: theme.colors.white,
                    }),
                  ])
                : View({
                    borderWidth: 2,
                    round: 4,
                    borderColor: theme.colors.gray[pressed ? 600 : 400],
                    h: 28,
                    w: 28,
                  })([]),
              Txt({ style: { margin: 4, fontSize: 14 } })(
                'Considerar habilidade',
              ),
            ]),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: theme.colors.gray[300] })([]),
        Row({ p: 16, justify: 'end' })([
          Row()([
            Pressable({
              mr: 8,
              p: 12,
              round: 4,
              pressed: { bg: theme.colors.primary[600] + '1f' },
              onPress: execute(
                replaceSApp(UiLens.at('modalParameters'))(false),
              ),
            })([
              Txt({ style: { color: theme.colors.primary[600] } })('Cancelar'),
            ]),
            Pressable({
              p: 12,
              round: 4,
              bg: theme.colors.primary[600],
              pressed: { bg: theme.colors.primary[800] },
              onPress: $(
                execute(replaceSApp(UiLens.at('modalParameters'))(false)),
                RIO.chain(() => generateResult),
                RIO.chain(() => navigate('Result')),
              ),
            })([Txt({ style: { color: theme.colors.white } })('Sortear')]),
          ]),
        ]),
      ]),
    ]),
  ])
