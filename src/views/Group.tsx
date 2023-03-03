import { $, A, Eq, IO, none, O, some } from 'fp'
import { useLayoutEffect } from 'react'
import { Txt } from 'src/components/hyperscript/derivative'
import {
  MaterialCommunityIcons,
  MaterialIcons,
} from 'src/components/hyperscript/icons'
import {
  FlatList,
  Modal,
  Pressable,
  View,
} from 'src/components/hyperscript/reactNative'
import { Player, PlayerIsActive, RatingShow } from 'src/datatypes/Player'
import { AppEnv, useEnv } from 'src/Env'
import { useDisclose } from 'src/hooks/useDisclose'
import { execute } from 'src/redux'
import {
  getGroupById,
  setAllPlayersActive,
  togglePlayerActive,
} from 'src/redux/slices/groups'
import {
  decrementTeamsCount,
  getParameters,
  incrementTeamsCount,
  togglePosition,
  toggleRating,
} from 'src/redux/slices/parameters'
import { useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'

export const Group = (props: RootStackScreenProps<'Group'>) => {
  const { navigation, route } = props
  const { id } = route.params
  const env = useEnv()
  const group = useAppSelector(getGroupById(id), O.getEq(Eq.eqStrict))
  const modalParameters = useDisclose()

  const players: Array<Player> = $(
    group,
    O.map(g => g.players),
    O.getOrElseW(() => []),
  )

  const allActive = $(players, A.every(PlayerIsActive))

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: ({ tintColor }) =>
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
              onPress: execute(
                setAllPlayersActive({ groupId: id, active: !allActive }),
              )(env),
            })([
              MaterialCommunityIcons({
                name: 'checkbox-multiple-outline',
                color: tintColor,
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
              onPress: () =>
                navigation.navigate('Player', { groupId: id, id: none }),
            })([MaterialIcons({ name: 'add', color: tintColor, size: 24 })]),
          ]),
      }),
    [allActive],
  )

  return View({ style: { flex: 1 } })([
    FlatList({
      data: players,
      keyExtractor: ({ id }) => id,
      renderItem: ({ item }) => Item({ data: item, parentProps: props, env }),
      initialNumToRender: 20,
    }),
    Pressable({
      style: ({ pressed }) => ({
        padding: 12,
        backgroundColor: pressed
          ? theme.colors.primary[800]
          : theme.colors.primary[600],
      }),
      onPress: modalParameters.onOpen,
    })([
      Txt({ style: { textAlign: 'center', color: theme.colors.white } })(
        'Sortear',
      ),
    ]),
    ParametersModal({ ...props, ...modalParameters }),
  ])
}

const Item = (props: {
  data: Player
  parentProps: RootStackScreenProps<'Group'>
  env: AppEnv
}) => {
  const { env } = props
  const { navigation, route } = props.parentProps
  const { id: groupId } = route.params
  const { id, name, position, rating, active } = props.data
  return Pressable({
    onPress: () => navigation.navigate('Player', { groupId, id: some(id) }),
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
      })(({ pressed }) =>
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
      ),
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
      Txt({ style: { color: theme.colors.darkText }, numberOfLines: 1 })(name),
    ]),
  ])
}

const ParametersModal = (
  props: RootStackScreenProps<'Group'> & { isOpen: boolean; onClose: IO<void> },
) => {
  const { navigation, route } = props
  const { id } = route.params
  const env = useEnv()
  const parameters = useAppSelector(getParameters)
  return Modal({
    transparent: true,
    visible: props.isOpen,
    style: { flex: 1 },
    animationType: 'fade',
    statusBarTranslucent: true,
  })([
    Pressable({
      style: {
        flex: 1,
        backgroundColor: theme.colors.black + '3f',
        justifyContent: 'center',
      },
      onPress: props.onClose,
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
            onPress: props.onClose,
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
              style: { flex: 1, paddingLeft: 8, color: theme.colors.darkText },
            })('Número de times'),
          ]),
          Pressable({
            style: { padding: 4 },
            onPress: execute(togglePosition)(env),
          })(({ pressed }) =>
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
          ),
          Pressable({
            style: { padding: 4 },
            onPress: execute(toggleRating)(env),
          })(({ pressed }) =>
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
          ),
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
              onPress: props.onClose,
            })([
              Txt({ style: { color: theme.colors.primary[600] } })('Cancelar'),
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
                props.onClose,
                IO.chain(() => () => navigation.navigate('Result', { id })),
              ),
            })([Txt({ style: { color: theme.colors.white } })('Sortear')]),
          ]),
        ]),
      ]),
    ]),
  ])
}
