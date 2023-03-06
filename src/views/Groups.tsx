import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import {
  $,
  $f,
  apply,
  constVoid,
  Eq,
  identity,
  IO,
  IOO,
  none,
  O,
  Option,
  S,
  some,
  Str,
} from 'fp'
import { useLayoutEffect } from 'react'
import { Input, Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'src/components/hyperscript/reactNative'
import { Group } from 'src/datatypes/Group'
import { useEnv } from 'src/Env'
import { execute, replaceSApp } from 'src/redux'
import {
  createGroup,
  deleteGroup,
  editGroup,
  getGroupById,
  getGroups,
} from 'src/redux/slices/groups'
import {
  getUi,
  setDeleteGroupModal,
  setUpsertGroupModal,
  setUpsertGroupName,
  UiLens,
} from 'src/redux/slices/ui'
import { RootState, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import { Id } from 'src/utils/Entity'

export const Groups = (props: RootStackScreenProps<'Groups'>) => {
  const { navigation } = props
  const env = useEnv()
  const groups = useAppSelector(getGroups)
  const ui = useAppSelector(getUi)

  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerRight: ({ tintColor }) =>
          Pressable({
            style: ({ pressed }) => ({
              marginRight: 4,
              padding: 8,
              borderRadius: 100,
              backgroundColor: pressed ? theme.colors.primary[700] : undefined,
            }),
            onPress: execute(
              setUpsertGroupModal(some({ id: O.none, name: '' })),
            )(env),
          })([MaterialIcons({ name: 'add', color: tintColor, size: 24 })]),
      }),
    [],
  )

  return View({
    style: { flex: 1 },
    onLayout: () => void SplashScreen.hideAsync(),
  })([
    StatusBar({ style: 'light' }),
    FlatList({
      data: groups,
      renderItem: ({ item }) =>
        Item({
          data: item,
          parentProps: props,
          openEdit: id =>
            $(
              S.gets(getGroupById(id)),
              S.chain(
                O.match(
                  () => S.modify<RootState>(identity),
                  g =>
                    setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
                ),
              ),
              execute,
            )(env),
          openDelete: id => execute(setDeleteGroupModal(some({ id })))(env),
        }),
    }),
    GroupModal({
      ...props,
      state: ui.modalUpsertGroup,
      onClose: execute(setUpsertGroupModal(none))(env),
    }),
    DeleteGroupModal({
      ...props,
      state: ui.modalDeleteGroup,
      onClose: execute(setDeleteGroupModal(none))(env),
    }),
  ])
}

const Item = (props: {
  data: Group
  parentProps: RootStackScreenProps<'Groups'>
  openEdit: (id: Id) => IO<void>
  openDelete: (id: Id) => IO<void>
}) => {
  const { name, id } = props.data
  const { navigation } = props.parentProps
  const env = useEnv()
  return Pressable({
    onPress: $(
      () => navigation.navigate('Group'),
      IO.chain(() =>
        execute(replaceSApp(UiLens.at('selectedGroupId'))(O.some(id)))(env),
      ),
    ),
  })([
    View({
      style: {
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        margin: 8,
        padding: 8,
        borderRadius: 8,
        elevation: 1,
      },
    })([
      Txt({
        numberOfLines: 1,
        style: { flex: 1, fontWeight: 'bold', color: theme.colors.darkText },
      })(name),
      Pressable({
        onPress: props.openEdit(id),
        style: { paddingHorizontal: 4 },
      })([
        MaterialIcons({
          name: 'edit',
          size: 24,
          color: theme.colors.gray[500],
        }),
      ]),
      Pressable({
        style: { paddingHorizontal: 4 },
        onPress: props.openDelete(id),
      })([
        MaterialIcons({
          name: 'delete',
          color: theme.colors.gray[500],
          size: 24,
        }),
      ]),
    ]),
  ])
}

const GroupModal = (
  props: RootStackScreenProps<'Groups'> & {
    state: Option<{ id: Option<Id>; name: string }>
    onClose: () => void
  },
) => {
  const env = useEnv()
  const group = useAppSelector(
    $(
      props.state,
      O.chain(({ id }) => id),
      O.map(getGroupById),
      O.getOrElseW(() => () => none),
    ),
    O.getEq(Eq.eqStrict),
  )

  return $(
    props.state,
    O.map(form =>
      Modal({
        transparent: true,
        visible: O.isSome(props.state),
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
              })(
                $(
                  props.state,
                  O.match(
                    () => 'Novo grupo',
                    () => 'Editar grupo',
                  ),
                ),
              ),
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
              View({})([
                Txt({
                  style: {
                    fontWeight: '500',
                    color: theme.colors.gray[500],
                    marginVertical: 4,
                  },
                })('Nome do grupo'),
                Input({
                  placeholder: 'Ex: Futebol de quinta',
                  value: form.name,
                  onChange: $f(setUpsertGroupName, execute, apply(env)),
                  placeholderTextColor: theme.colors.gray[400],
                  cursorColor: theme.colors.darkText,
                  style: ({ isFocused }) => ({
                    fontSize: 12,
                    padding: 8,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: isFocused
                      ? theme.colors.primary[600]
                      : theme.colors.gray[300],
                    backgroundColor: isFocused
                      ? theme.colors.primary[600] + '1f'
                      : undefined,
                  }),
                }),
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
                  onPress: props.onClose,
                })([
                  Txt({ style: { color: theme.colors.primary[600] } })(
                    'Cancelar',
                  ),
                ]),
                Pressable({
                  style: ({ pressed }) => ({
                    padding: 12,
                    backgroundColor: !form.name
                      ? theme.colors.primary[600] + '5f'
                      : pressed
                      ? theme.colors.primary[800]
                      : theme.colors.primary[600],
                    borderRadius: 4,
                  }),
                  onPress: Str.isEmpty(form.name)
                    ? constVoid
                    : $(
                        IOO.fromIO(execute(setUpsertGroupModal(O.none))(env)),
                        IOO.chainOptionK(() => group),
                        IOO.matchEW(
                          () => createGroup({ name: form.name })(env),
                          g =>
                            execute(editGroup({ id: g.id, name: form.name }))(
                              env,
                            ),
                        ),
                      ),
                })([
                  Txt({
                    style: {
                      color: !form.name
                        ? theme.colors.white + '5f'
                        : theme.colors.white,
                    },
                  })('Gravar'),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ),
    O.toNullable,
  )
}

const DeleteGroupModal = (
  props: RootStackScreenProps<'Groups'> & {
    state: Option<{ id: Id }>
    onClose: () => void
  },
) => {
  const group = useAppSelector(
    $(
      props.state,
      O.map(({ id }) => id),
      O.map(getGroupById),
      O.getOrElseW(() => () => none),
    ),
    O.getEq(Eq.eqStrict),
  )
  const env = useEnv()
  return Modal({
    transparent: true,
    visible: O.isSome(props.state),
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
          })('Excluir grupo'),
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
          Text({})([
            $(
              group,
              O.matchW(
                () => null,
                g =>
                  Text({ style: { color: theme.colors.darkText } })([
                    'Deseja excluir o grupo ',
                    Txt({
                      style: {
                        fontWeight: 'bold',
                        color: theme.colors.darkText,
                      },
                    })(g.name),
                    ' e todos os jogadores?',
                  ]),
              ),
            ),
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
                  ? theme.colors.danger[600] + '1f'
                  : undefined,
                borderRadius: 4,
              }),
              onPress: props.onClose,
            })([
              Txt({ style: { color: theme.colors.danger[600] } })('Cancelar'),
            ]),
            Pressable({
              style: ({ pressed }) => ({
                padding: 12,
                backgroundColor: pressed
                  ? theme.colors.danger[800]
                  : theme.colors.danger[600],
                borderRadius: 4,
              }),
              onPress: $(
                IOO.fromIO(props.onClose),
                IOO.chainOptionK(() => group),
                IOO.chainIOK(g => execute(deleteGroup({ id: g.id }))(env)),
              ),
            })([Txt({ style: { color: theme.colors.white } })('Excluir')]),
          ]),
        ]),
      ]),
    ]),
  ])
}
