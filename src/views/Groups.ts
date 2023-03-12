import * as SplashScreen from 'expo-splash-screen'
import {
  $,
  $f,
  A,
  Eq,
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
import { not } from 'fp-ts/Predicate'
import { memoized, memoizedConst } from 'src/components/helpers'
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
import { execute, replaceSApp, storeGet } from 'src/redux'
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
import { Optic } from 'src/utils/Optic'

const doNothing = RIO.of<unknown, void>(undefined)

const onUIMount = RIO.fromIO(SplashScreen.hideAsync)

const onOpenNewGroupModal = execute(
  setUpsertGroupModal(some({ id: O.none, name: '' })),
)

const onOpenEdit = (id: Id) =>
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

const onOpenDelete = (id: Id) => execute(setDeleteGroupModal(some({ id })))

const onSelectGroup = (id: Id) =>
  $(
    navigate('Group'),
    RIO.chain(() =>
      execute(replaceSApp(UiLens.at('selectedGroupId'))(O.some(id))),
    ),
  )

const onCloseGroupModal = execute(setUpsertGroupModal(none))

const onChangeGroupName = $f(setUpsertGroupName, execute)

const onSaveGroup = $(
  storeGet,
  RIO.chain(s =>
    $(
      s.ui.modalUpsertGroup,
      O.filter(not(m => Str.isEmpty(m.name))),
      O.map(m =>
        $(
          m.id,
          O.matchW(
            () => createGroup({ name: m.name }),
            id => execute(editGroup({ id, name: m.name })),
          ),
          RIO.apFirst(execute(setUpsertGroupModal(O.none))),
        ),
      ),
      O.getOrElseW(() => doNothing),
    ),
  ),
)

const onCloseDeleteModal = execute(setDeleteGroupModal(none))

const onDeleteGroup = $(
  S.gets(Optic.get(UiLens.at('modalDeleteGroup'))),
  S.chain(
    O.match(
      () => S.of<RootState, void>(undefined),
      ({ id }) => deleteGroup({ id }),
    ),
  ),
  S.apFirst(setDeleteGroupModal(none)),
  execute,
)

export const Groups = memoized('Groups')(
  Eq.struct({
    ui: Eq.struct({
      modalDeleteGroup: Eq.eqStrict,
      modalUpsertGroup: Eq.eqStrict,
    }),
  }),
  ({
    ui: { modalDeleteGroup, modalUpsertGroup },
    groups,
  }: {
    ui: RootState['ui']
    groups: GroupsState
  }) =>
    View({ flex: 1, onLayout: onUIMount })([
      ScreenHeader,
      FlatList({
        data: $(groups, Rec.toEntries, A.map(Tup.snd)),
        renderItem: Item,
      }),
      GroupModal({ state: modalUpsertGroup }),
      DeleteGroupModal({
        state: modalDeleteGroup,
        group: $(
          modalDeleteGroup,
          O.map(({ id }) => id),
          O.chain(id => $(groups, Rec.lookup(id))),
        ),
      }),
    ]),
)

const ScreenHeader = memoizedConst('Header')(
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
        onPress: onOpenNewGroupModal,
      })([
        MaterialIcons({
          name: 'add',
          color: theme.colors.lightText,
          size: 24,
        }),
      ]),
    }),
  ]),
)

const Item = memoized('GroupItem')(
  Eq.struct({ name: Eq.eqStrict, id: Eq.eqStrict }),
  ({ name, id }: Group) =>
    Pressable({ onPress: onSelectGroup(id) })([
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
        Pressable({ onPress: onOpenEdit(id), px: 4 })([
          MaterialIcons({
            name: 'edit',
            size: 24,
            color: theme.colors.gray[500],
          }),
        ]),
        Pressable({ px: 4, onPress: onOpenDelete(id) })([
          MaterialIcons({
            name: 'delete',
            color: theme.colors.gray[500],
            size: 24,
          }),
        ]),
      ]),
    ]),
)

const GroupModal = ({
  state,
}: {
  state: Option<{ id: Option<Id>; name: string }>
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
        onRequestClose: onCloseGroupModal,
      })([
        Pressable({
          flex: 1,
          bg: theme.colors.black + '3f',
          justify: 'center',
          onPress: onCloseGroupModal,
        })([
          Pressable({
            bg: theme.colors.white,
            m: 48,
            round: 8,
            shadow: 2,
            onPress: doNothing,
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
                  O.chain(s => s.id),
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
                onPress: onCloseGroupModal,
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
                  onChange: onChangeGroupName,
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
                  onPress: onCloseGroupModal,
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
                  onPress: onSaveGroup,
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
    onRequestClose: onCloseDeleteModal,
  })([
    Pressable({
      flex: 1,
      bg: theme.colors.black + '3f',
      justify: 'center',
      onPress: onCloseDeleteModal,
    })([
      Pressable({
        bg: theme.colors.white,
        m: 48,
        round: 8,
        shadow: 2,
        onPress: doNothing,
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
            onPress: onCloseDeleteModal,
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
              onPress: onCloseDeleteModal,
            })([
              Txt({ style: { color: theme.colors.danger[600] } })('Cancelar'),
            ]),
            Pressable({
              p: 12,
              round: 4,
              bg: theme.colors.danger[600],
              pressed: { bg: theme.colors.danger[800] },
              onPress: onDeleteGroup,
            })([Txt({ style: { color: theme.colors.white } })('Excluir')]),
          ]),
        ]),
      ]),
    ]),
  ])
