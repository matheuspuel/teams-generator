import * as SplashScreen from 'expo-splash-screen'
import {
  $,
  $f,
  A,
  Eq,
  identity,
  none,
  O,
  Optic,
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
import { Fragment } from 'src/components/hyperscript/react'
import { Text } from 'src/components/hyperscript/reactNative'
import { FlatList } from 'src/components/safe/basic/FlatList'
import { Modal } from 'src/components/safe/basic/Modal'
import { Input } from 'src/components/util-props/basic/Input'
import { Pressable } from 'src/components/util-props/basic/Pressable'
import { Row } from 'src/components/util-props/basic/Row'
import { Txt } from 'src/components/util-props/basic/Txt'
import { View } from 'src/components/util-props/basic/View'
import { MaterialIcons } from 'src/components/util-props/icons/MaterialIcons'
import { Header } from 'src/components/util-props/react-navigation/Header'
import { Group } from 'src/datatypes/Group'
import { RootState } from 'src/model'
import { execute, replaceSApp, storeGet } from 'src/services/Store'
import {
  createGroup,
  deleteGroup,
  editGroup,
  getGroupById,
  GroupsState,
} from 'src/slices/groups'
import { navigate } from 'src/slices/routes'
import {
  setDeleteGroupModal,
  setUpsertGroupModal,
  setUpsertGroupName,
  UiLens,
} from 'src/slices/ui'
import { colors } from 'src/theme'
import { shade, toHex, withOpacity } from 'src/utils/datatypes/Color'
import { Id } from 'src/utils/Entity'

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
  View({ bg: colors.white })([
    Header({
      title: 'Grupos',
      headerStyle: { backgroundColor: colors.primary.$5 },
      headerTitleStyle: { color: colors.lightText },
      headerRight: Pressable({
        mr: 4,
        p: 8,
        round: 100,
        pressed: { bg: withOpacity(47)(colors.black) },
        onPress: onOpenNewGroupModal,
      })([MaterialIcons({ name: 'add', color: colors.lightText, size: 24 })]),
    }),
  ]),
)

const Item = memoized('GroupItem')(
  Eq.struct({ name: Eq.eqStrict, id: Eq.eqStrict }),
  ({ name, id }: Group) =>
    Pressable({ onPress: onSelectGroup(id) })([
      Row({
        bg: colors.white,
        align: 'center',
        m: 8,
        p: 8,
        round: 8,
        shadow: 1,
      })([
        Txt({ numberOfLines: 1, flex: 1, weight: 600, color: colors.darkText })(
          name,
        ),
        Pressable({ onPress: onOpenEdit(id), px: 4 })([
          MaterialIcons({ name: 'edit', size: 24, color: colors.gray.$4 }),
        ]),
        Pressable({ px: 4, onPress: onOpenDelete(id) })([
          MaterialIcons({ name: 'delete', color: colors.gray.$4, size: 24 }),
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
          bg: withOpacity(63)(colors.black),
          justify: 'center',
          onPress: onCloseGroupModal,
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
                pressed: { bg: withOpacity(31)(colors.gray.$5) },
                onPress: onCloseGroupModal,
              })([
                MaterialIcons({
                  name: 'close',
                  size: 24,
                  color: colors.gray.$4,
                }),
              ]),
            ]),
            View({ borderWidthT: 1, borderColor: colors.gray.$2 })([]),
            View({ p: 16 })([
              View()([
                Txt({ weight: 500, color: colors.gray.$4, my: 4 })(
                  'Nome do grupo',
                ),
                Input({
                  placeholder: 'Ex: Futebol de quinta',
                  value: form.name,
                  onChange: onChangeGroupName,
                  placeholderTextColor: colors.gray.$3,
                  cursorColor: colors.darkText,
                  fontSize: 12,
                  p: 8,
                  px: 14,
                  borderWidth: 1,
                  round: 4,
                  borderColor: colors.gray.$2,
                  focused: {
                    bg: withOpacity(31)(colors.primary.$5),
                    borderColor: colors.primary.$5,
                  },
                }),
              ]),
            ]),
            View({ borderWidthT: 1, borderColor: colors.gray.$2 })([]),
            Row({ justify: 'end', p: 16 })([
              Row()([
                Pressable({
                  mr: 8,
                  p: 12,
                  round: 4,
                  pressed: { bg: withOpacity(31)(colors.primary.$5) },
                  onPress: onCloseGroupModal,
                })([Txt({ color: colors.primary.$5 })('Cancelar')]),
                Pressable({
                  p: 12,
                  round: 4,
                  bg: !form.name
                    ? withOpacity(95)(colors.primary.$5)
                    : colors.primary.$5,
                  pressed: {
                    bg: form.name ? shade(0.4)(colors.primary.$5) : undefined,
                  },
                  onPress: onSaveGroup,
                })([
                  Txt({
                    color: !form.name
                      ? withOpacity(95)(colors.white)
                      : colors.white,
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
      bg: withOpacity(63)(colors.black),
      justify: 'center',
      onPress: onCloseDeleteModal,
    })([
      Pressable({
        bg: colors.white,
        m: 48,
        round: 8,
        shadow: 2,
        onPress: doNothing,
      })([
        Row({ align: 'center', p: 8 })([
          Txt({ m: 8, flex: 1, size: 16, weight: 600, color: colors.darkText })(
            'Excluir grupo',
          ),
          Pressable({
            p: 8,
            round: 4,
            pressed: { bg: withOpacity(31)(colors.gray.$5) },
            onPress: onCloseDeleteModal,
          })([
            MaterialIcons({ name: 'close', size: 24, color: colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: colors.gray.$2 })([]),
        View({ p: 16 })([
          Text()([
            $(
              group,
              O.matchW(
                () => Fragment([]),
                g =>
                  Text({ style: { color: toHex(colors.darkText) } })([
                    () => 'Deseja excluir o grupo ',
                    Txt({ weight: 600, color: colors.darkText })(g.name),
                    () => ' e todos os jogadores?',
                  ]),
              ),
            ),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: colors.gray.$2 })([]),
        Row({ p: 16, justify: 'end' })([
          Row()([
            Pressable({
              mr: 8,
              p: 12,
              round: 4,
              pressed: { bg: withOpacity(31)(colors.danger.$5) },
              onPress: onCloseDeleteModal,
            })([Txt({ color: colors.danger.$5 })('Cancelar')]),
            Pressable({
              p: 12,
              round: 4,
              bg: colors.danger.$5,
              pressed: { bg: shade(0.4)(colors.danger.$5) },
              onPress: onDeleteGroup,
            })([Txt({ color: colors.white })('Excluir')]),
          ]),
        ]),
      ]),
    ]),
  ])
