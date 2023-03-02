import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { $, constVoid, Eq, IO, IOO, none, O, Option, some, Str } from 'fp'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'src/components/hyperscript/reactNative'
import { Input } from 'src/components/Input'
import { Group } from 'src/datatypes/Group'
import { getGroupById, getGroups, groupsSlice } from 'src/redux/slices/groups'
import { useAppDispatch, useAppSelector } from 'src/redux/store'
import { RootStackScreenProps } from 'src/routes/RootStack'
import { theme } from 'src/theme'
import { Id } from 'src/utils/Entity'

export const Groups = (props: RootStackScreenProps<'Groups'>) => {
  const { navigation } = props
  const groups = useAppSelector(getGroups)
  const [modal, setModal] = useState<Option<Option<{ id: Id }>>>(none)
  const [deleteModal, setDeleteModal] = useState<Option<{ id: Id }>>(none)

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
            onPress: () => setModal(some(none)),
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
          openEdit: id => setModal(some(some({ id }))),
          openDelete: id => setDeleteModal(some({ id })),
        }),
    }),
    GroupModal({ ...props, state: modal, onClose: () => setModal(none) }),
    DeleteGroupModal({
      ...props,
      state: deleteModal,
      onClose: () => setDeleteModal(none),
    }),
  ])
}

const Item = (props: {
  data: Group
  parentProps: RootStackScreenProps<'Groups'>
  openEdit: (id: Id) => void
  openDelete: (id: Id) => void
}) => {
  const { name, id } = props.data
  const { navigation } = props.parentProps
  return Pressable({ onPress: () => navigation.navigate('Group', { id }) })([
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
        onPress: () => props.openEdit(id),
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
        onPress: () => props.openDelete(id),
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
    state: Option<Option<{ id: Id }>>
    onClose: () => void
  },
) => {
  const dispatch = useAppDispatch()
  const group = useAppSelector(
    $(
      props.state,
      O.flatten,
      O.map(({ id }) => id),
      O.map(getGroupById),
      O.getOrElseW(() => () => none),
    ),
    O.getEq(Eq.eqStrict).equals,
  )
  const [groupName, setGroupName] = useState('')

  useEffect(
    () =>
      setGroupName(
        $(
          group,
          O.map(g => g.name),
          O.getOrElse(() => ''),
        ),
      ),
    [group],
  )

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
          })(
            $(
              props.state,
              O.flatten,
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
              value: groupName,
              onChangeText: setGroupName,
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
              Txt({ style: { color: theme.colors.primary[600] } })('Cancelar'),
            ]),
            Pressable({
              style: ({ pressed }) => ({
                padding: 12,
                backgroundColor: !groupName
                  ? theme.colors.primary[600] + '5f'
                  : pressed
                  ? theme.colors.primary[800]
                  : theme.colors.primary[600],
                borderRadius: 4,
              }),
              onPress: Str.isEmpty(groupName)
                ? constVoid
                : $(
                    IOO.fromIO(props.onClose),
                    IOO.chainOptionK(() => group),
                    IOO.matchEW(
                      () => (): unknown =>
                        dispatch(groupsSlice.actions.add({ name: groupName })),
                      g => (): unknown =>
                        dispatch(
                          groupsSlice.actions.edit({
                            id: g.id,
                            name: groupName,
                          }),
                        ),
                    ),
                    IO.chainFirst(() => () => setGroupName('')),
                  ),
            })([
              Txt({
                style: {
                  color: !groupName
                    ? theme.colors.white + '5f'
                    : theme.colors.white,
                },
              })('Gravar'),
            ]),
          ]),
        ]),
      ]),
    ]),
  ])
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
    O.getEq(Eq.eqStrict).equals,
  )
  const dispatch = useAppDispatch()
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
                IOO.chainIOK(
                  g => () => dispatch(groupsSlice.actions.delete({ id: g.id })),
                ),
              ),
            })([Txt({ style: { color: theme.colors.white } })('Excluir')]),
          ]),
        ]),
      ]),
    ]),
  ])
}
