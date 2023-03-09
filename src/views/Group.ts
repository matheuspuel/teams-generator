import { $, $f, A, constVoid, IO, O, Option, RIO, S } from 'fp'
import { Txt } from 'src/components/hyperscript/derivative'
import {
  MaterialCommunityIcons,
  MaterialIcons,
} from 'src/components/hyperscript/icons'
import {
  Header,
  HeaderBackButton,
} from 'src/components/hyperscript/react-navigation'
import {
  FlatList,
  Modal,
  Pressable,
  View,
} from 'src/components/hyperscript/reactNative'
import { Group } from 'src/datatypes/Group'
import { Parameters } from 'src/datatypes/Parameters'
import { Player, PlayerIsActive, RatingShow } from 'src/datatypes/Player'
import { AppEnv } from 'src/Env'
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

export const GroupView =
  ({
    parameters,
    groupId,
    group,
    modalParameters,
  }: {
    parameters: Parameters
    groupId: Option<Id>
    group: Option<Group>
    modalParameters: boolean
  }) =>
  (env: AppEnv) => {
    const players: Array<Player> = $(
      group,
      O.map(g => g.players),
      O.getOrElseW(() => []),
    )
    return View({ style: { flex: 1 } })([
      View({})([
        Header({
          title: 'Grupo',
          headerStyle: { backgroundColor: theme.colors.primary[600] },
          headerTitleStyle: { color: theme.colors.lightText },
          headerLeft: () =>
            HeaderBackButton({
              onPress: goBack(env),
              tintColor: theme.colors.lightText,
            }),
          headerRight: () =>
            View({ style: { flexDirection: 'row' } })([
              Pressable({
                style: ({ pressed }) => ({
                  marginRight: 4,
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: pressed
                    ? theme.colors.primary[700]
                    : undefined,
                }),
                onPress: $(
                  groupId,
                  O.match(
                    () => constVoid,
                    id =>
                      execute(
                        setAllPlayersActive({
                          groupId: id,
                          active: !$(players, A.every(PlayerIsActive)),
                        }),
                      )(env),
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
                style: ({ pressed }) => ({
                  marginRight: 4,
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: pressed
                    ? theme.colors.primary[700]
                    : undefined,
                }),
                onPress: $(
                  navigate('Player')(env),
                  IO.chain(() =>
                    $(
                      replaceSApp(UiLens.at('selectedPlayerId'))(O.none),
                      S.apFirst(replaceSApp(PlayerFormLens)(blankPlayerForm)),
                      execute,
                    )(env),
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
            renderItem: ({ item }) => Item({ data: item, groupId })(env),
            initialNumToRender: 20,
          }),
        ),
        A.fromOption,
      ),
      Pressable({
        style: ({ pressed }) => ({
          padding: 12,
          backgroundColor: pressed
            ? theme.colors.primary[800]
            : theme.colors.primary[600],
        }),
        onPress: execute(replaceSApp(UiLens.at('modalParameters'))(true))(env),
      })([
        Txt({ style: { textAlign: 'center', color: theme.colors.white } })(
          'Sortear',
        ),
      ]),
      ...(modalParameters ? [ParametersModal({ parameters })(env)] : []),
    ])
  }

const Item =
  ({
    data: { id, name, position, rating, active },
    groupId,
  }: {
    data: Player
    groupId: Id
  }) =>
  (env: AppEnv) =>
    Pressable({
      onPress: $(
        navigate('Player')(env),
        IO.chain(() =>
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
          )(env),
        ),
      ),
    })([
      View({
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.white,
          margin: 4,
          padding: 4,
          borderRadius: 8,
          elevation: 1,
        },
      })([
        Pressable({
          style: { marginRight: 8 },
          onPress: execute(togglePlayerActive({ groupId, playerId: id }))(env),
        })(({ pressed }) => [
          active
            ? View({
                style: {
                  borderWidth: 2,
                  borderRadius: 4,
                  height: 28,
                  width: 28,
                  backgroundColor: theme.colors.primary[pressed ? 800 : 600],
                  borderColor: theme.colors.primary[pressed ? 800 : 600],
                },
              })([
                MaterialIcons({
                  name: 'check',
                  size: 24,
                  color: theme.colors.white,
                }),
              ])
            : View({
                style: {
                  borderWidth: 2,
                  borderRadius: 4,
                  borderColor: theme.colors.gray[pressed ? 600 : 400],
                  height: 28,
                  width: 28,
                },
              })([]),
        ]),
        View({
          style: {
            aspectRatio: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            borderRadius: 9999,
            backgroundColor: theme.colors.amber[300],
          },
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
        Txt({ style: { color: theme.colors.darkText }, numberOfLines: 1 })(
          name,
        ),
      ]),
    ])

const ParametersModal =
  ({ parameters }: { parameters: Parameters }) =>
  (env: AppEnv) =>
    Modal({
      transparent: true,
      style: { flex: 1 },
      animationType: 'fade',
      statusBarTranslucent: true,
      onRequestClose: execute(replaceSApp(UiLens.at('modalParameters'))(false))(
        env,
      ),
    })([
      Pressable({
        style: {
          flex: 1,
          backgroundColor: theme.colors.black + '3f',
          justifyContent: 'center',
        },
        onPress: execute(replaceSApp(UiLens.at('modalParameters'))(false))(env),
      })([
        Pressable({
          style: {
            backgroundColor: theme.colors.white,
            margin: 48,
            borderRadius: 8,
            elevation: 2,
          },
        })([
          View({
            style: { flexDirection: 'row', alignItems: 'center', padding: 8 },
          })([
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
              style: ({ pressed }) => ({
                padding: 8,
                backgroundColor: pressed
                  ? theme.colors.gray[600] + '1f'
                  : undefined,
                borderRadius: 4,
              }),
              onPress: execute(
                replaceSApp(UiLens.at('modalParameters'))(false),
              )(env),
            })([
              MaterialIcons({
                name: 'close',
                size: 24,
                color: theme.colors.gray[500],
              }),
            ]),
          ]),
          View({
            style: { borderTopWidth: 1, borderColor: theme.colors.gray[300] },
          })([]),
          View({ style: { padding: 16 } })([
            View({ style: { flexDirection: 'row', alignItems: 'center' } })([
              Pressable({
                style: ({ pressed }) => ({
                  padding: 12,
                  backgroundColor: pressed
                    ? theme.colors.primary[600] + '1f'
                    : undefined,
                  borderRadius: 4,
                }),
                onPress: execute(decrementTeamsCount)(env),
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
                style: ({ pressed }) => ({
                  padding: 12,
                  backgroundColor: pressed
                    ? theme.colors.primary[600] + '1f'
                    : undefined,
                  borderRadius: 4,
                }),
                onPress: execute(incrementTeamsCount)(env),
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
            Pressable({
              style: { padding: 4 },
              onPress: execute(togglePosition)(env),
            })(({ pressed }) => [
              View({ style: { flexDirection: 'row', alignItems: 'center' } })([
                parameters.position
                  ? View({
                      style: {
                        borderWidth: 2,
                        borderRadius: 4,
                        height: 28,
                        width: 28,
                        backgroundColor:
                          theme.colors.primary[pressed ? 800 : 600],
                        borderColor: theme.colors.primary[pressed ? 800 : 600],
                      },
                    })([
                      MaterialIcons({
                        name: 'check',
                        size: 24,
                        color: theme.colors.white,
                      }),
                    ])
                  : View({
                      style: {
                        borderWidth: 2,
                        borderRadius: 4,
                        borderColor: theme.colors.gray[pressed ? 600 : 400],
                        height: 28,
                        width: 28,
                      },
                    })([]),
                Txt({ style: { margin: 4, fontSize: 14 } })(
                  'Considerar posições',
                ),
              ]),
            ]),
            Pressable({
              style: { padding: 4 },
              onPress: execute(toggleRating)(env),
            })(({ pressed }) => [
              View({ style: { flexDirection: 'row', alignItems: 'center' } })([
                parameters.rating
                  ? View({
                      style: {
                        borderWidth: 2,
                        borderRadius: 4,
                        height: 28,
                        width: 28,
                        backgroundColor:
                          theme.colors.primary[pressed ? 800 : 600],
                        borderColor: theme.colors.primary[pressed ? 800 : 600],
                      },
                    })([
                      MaterialIcons({
                        name: 'check',
                        size: 24,
                        color: theme.colors.white,
                      }),
                    ])
                  : View({
                      style: {
                        borderWidth: 2,
                        borderRadius: 4,
                        borderColor: theme.colors.gray[pressed ? 600 : 400],
                        height: 28,
                        width: 28,
                      },
                    })([]),
                Txt({ style: { margin: 4, fontSize: 14 } })(
                  'Considerar habilidade',
                ),
              ]),
            ]),
          ]),
          View({
            style: { borderTopWidth: 1, borderColor: theme.colors.gray[300] },
          })([]),
          View({
            style: {
              flexDirection: 'row',
              padding: 16,
              justifyContent: 'flex-end',
            },
          })([
            View({ style: { flexDirection: 'row' } })([
              Pressable({
                style: ({ pressed }) => ({
                  marginRight: 8,
                  padding: 12,
                  backgroundColor: pressed
                    ? theme.colors.primary[600] + '1f'
                    : undefined,
                  borderRadius: 4,
                }),
                onPress: execute(
                  replaceSApp(UiLens.at('modalParameters'))(false),
                )(env),
              })([
                Txt({ style: { color: theme.colors.primary[600] } })(
                  'Cancelar',
                ),
              ]),
              Pressable({
                style: ({ pressed }) => ({
                  padding: 12,
                  backgroundColor: pressed
                    ? theme.colors.primary[800]
                    : theme.colors.primary[600],
                  borderRadius: 4,
                }),
                onPress: $(
                  execute(replaceSApp(UiLens.at('modalParameters'))(false)),
                  RIO.chain(() => generateResult),
                  RIO.chain(() => navigate('Result')),
                )(env),
              })([Txt({ style: { color: theme.colors.white } })('Sortear')]),
            ]),
          ]),
        ]),
      ]),
    ])
