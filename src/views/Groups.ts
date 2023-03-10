import * as SplashScreen from 'expo-splash-screen'
import {
  $,
  $f,
  A,
  constVoid,
  identity,
  none,
  O,
  Option,
  Rec,
  RIO,
  S,
  some,
  Str,
  Tup,
} from 'fp'
import { Txt } from 'src/components/hyperscript/derivative'
import { MaterialIcons } from 'src/components/hyperscript/icons'
import { Fragment } from 'src/components/hyperscript/react'
import { Text } from 'src/components/hyperscript/reactNative'
import { FlatList } from 'src/components/safe/basic/FlatList'
import { Input } from 'src/components/safe/basic/Input'
import { Modal } from 'src/components/safe/basic/Modal'
import { Header } from 'src/components/safe/react-navigation/Header'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { View } from 'src/components/util-props/basic/View'
import { Group } from 'src/datatypes/Group'
import { execute, replaceSApp } from 'src/redux'
import {
  createGroup,
  deleteGroup,
  editGroup,
  getGroupById,
  GroupsState,
} from 'src/redux/slices/groups'
import { navigate } from 'src/redux/slices/routes'
import {
  setDeleteGroupModal,
  setUpsertGroupModal,
  setUpsertGroupName,
  UiLens,
} from 'src/redux/slices/ui'
import { RootState } from 'src/redux/store'
import { theme } from 'src/theme'
import { Id } from 'src/utils/Entity'

export const Groups = ({
  ui,
  groups,
}: {
  ui: RootState['ui']
  groups: GroupsState
}) =>
  View({ flex: 1, onLayout: RIO.fromIO(SplashScreen.hideAsync) })([
    View({ bg: theme.colors.white })([
      Header({
        title: 'Grupos',
        headerStyle: { backgroundColor: theme.colors.primary[600] },
        headerTitleStyle: { color: theme.colors.lightText },
        headerRight: Pressable({
          mr: 4,
          p: 8,
          round: 100,
          pressed: { bg: theme.colors.primary[700] },
          onPress: execute(setUpsertGroupModal(some({ id: O.none, name: '' }))),
        })([
          MaterialIcons({
            name: 'add',
            color: theme.colors.lightText,
            size: 24,
          }),
        ]),
      }),
    ]),
    FlatList({
      data: $(groups, Rec.toEntries, A.map(Tup.snd)),
      renderItem: Item,
    }),
    GroupModal({
      state: ui.modalUpsertGroup,
      group: $(
        ui.modalUpsertGroup,
        O.chain(({ id }) => id),
        O.chain(id => $(groups, Rec.lookup(id))),
      ),
    }),
    DeleteGroupModal({
      state: ui.modalDeleteGroup,
      group: $(
        ui.modalDeleteGroup,
        O.map(({ id }) => id),
        O.chain(id => $(groups, Rec.lookup(id))),
      ),
    }),
  ])

const openEdit = (id: Id) =>
  $(
    S.gets(getGroupById(id)),
    S.chain(
      O.match(
        () => S.modify<RootState>(identity),
        g => setUpsertGroupModal(some({ id: O.some(id), name: g.name })),
      ),
    ),
    execute,
  )

const openDelete = (id: Id) => execute(setDeleteGroupModal(some({ id })))

const Item = ({ name, id }: Group) =>
  Pressable({
    onPress: $(
      navigate('Group'),
      RIO.chain(() =>
        execute(replaceSApp(UiLens.at('selectedGroupId'))(O.some(id))),
      ),
    ),
  })([
    Row({
      bg: theme.colors.white,
      align: 'center',
      m: 8,
      p: 8,
      round: 8,
      shadow: 1,
    })([
      Txt({
        numberOfLines: 1,
        style: { flex: 1, fontWeight: 'bold', color: theme.colors.darkText },
      })(name),
      Pressable({ onPress: openEdit(id), px: 4 })([
        MaterialIcons({
          name: 'edit',
          size: 24,
          color: theme.colors.gray[500],
        }),
      ]),
      Pressable({ px: 4, onPress: openDelete(id) })([
        MaterialIcons({
          name: 'delete',
          color: theme.colors.gray[500],
          size: 24,
        }),
      ]),
    ]),
  ])

const GroupModal = ({
  state,
  group,
}: {
  state: Option<{ id: Option<Id>; name: string }>
  group: Option<Group>
}) =>
  $(
    state,
    O.map(form =>
      Modal({
        transparent: true,
        visible: O.isSome(state),
        style: { flex: 1 },
        animationType: 'fade',
        statusBarTranslucent: true,
        onRequestClose: execute(setUpsertGroupModal(none)),
      })([
        Pressable({
          flex: 1,
          bg: theme.colors.black + '3f',
          justify: 'center',
          onPress: execute(setUpsertGroupModal(none)),
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
              })(
                $(
                  state,
                  O.match(
                    () => 'Novo grupo',
                    () => 'Editar grupo',
                  ),
                ),
              ),
              Pressable({
                p: 8,
                round: 4,
                pressed: { bg: theme.colors.gray[600] + '1f' },
                onPress: execute(setUpsertGroupModal(none)),
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
              View()([
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
                  onChange: $f(setUpsertGroupName, execute),
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
            View({ borderWidthT: 1, borderColor: theme.colors.gray[300] })([]),
            Row({ justify: 'end', p: 16 })([
              Row()([
                Pressable({
                  mr: 8,
                  p: 12,
                  round: 4,
                  pressed: { bg: theme.colors.primary[600] + '1f' },
                  onPress: execute(setUpsertGroupModal(none)),
                })([
                  Txt({ style: { color: theme.colors.primary[600] } })(
                    'Cancelar',
                  ),
                ]),
                Pressable({
                  p: 12,
                  round: 4,
                  bg: !form.name
                    ? theme.colors.primary[600] + '5f'
                    : theme.colors.primary[600],
                  pressed: {
                    bg: form.name ? theme.colors.primary[800] : undefined,
                  },
                  onPress: Str.isEmpty(form.name)
                    ? () => constVoid
                    : $(
                        execute(setUpsertGroupModal(O.none)),
                        RIO.apFirst(
                          $(
                            group,
                            O.matchW(
                              () => createGroup({ name: form.name }),
                              g =>
                                execute(
                                  editGroup({ id: g.id, name: form.name }),
                                ),
                            ),
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
    O.getOrElseW(() => Fragment([])),
  )

const DeleteGroupModal = ({
  group,
  state,
}: {
  state: Option<{ id: Id }>
  group: Option<Group>
}) =>
  Modal({
    transparent: true,
    visible: O.isSome(state),
    style: { flex: 1 },
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: execute(setDeleteGroupModal(none)),
  })([
    Pressable({
      flex: 1,
      bg: theme.colors.black + '3f',
      justify: 'center',
      onPress: execute(setDeleteGroupModal(none)),
    })([
      Pressable({
        bg: theme.colors.white,
        m: 48,
        round: 8,
        shadow: 2,
        onPress: RIO.of(undefined),
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
          })('Excluir grupo'),
          Pressable({
            p: 8,
            round: 4,
            pressed: { bg: theme.colors.gray[600] + '1f' },
            onPress: execute(setDeleteGroupModal(none)),
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
          Text()([
            $(
              group,
              O.matchW(
                () => Fragment([]),
                g =>
                  Text({ style: { color: theme.colors.darkText } })([
                    () => 'Deseja excluir o grupo ',
                    Txt({
                      style: {
                        fontWeight: 'bold',
                        color: theme.colors.darkText,
                      },
                    })(g.name),
                    () => ' e todos os jogadores?',
                  ]),
              ),
            ),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: theme.colors.gray[300] })([]),
        Row({ p: 16, justify: 'end' })([
          Row()([
            Pressable({
              mr: 8,
              p: 12,
              round: 4,
              pressed: { bg: theme.colors.danger[600] + '1f' },
              onPress: execute(setDeleteGroupModal(none)),
            })([
              Txt({ style: { color: theme.colors.danger[600] } })('Cancelar'),
            ]),
            Pressable({
              p: 12,
              round: 4,
              bg: theme.colors.danger[600],
              pressed: { bg: theme.colors.danger[800] },
              onPress: $(
                execute(setDeleteGroupModal(none)),
                RIO.apFirst(
                  $(
                    group,
                    O.matchW(
                      () => () => constVoid,
                      g => execute(deleteGroup({ id: g.id })),
                    ),
                  ),
                ),
              ),
            })([Txt({ style: { color: theme.colors.white } })('Excluir')]),
          ]),
        ]),
      ]),
    ]),
  ])
