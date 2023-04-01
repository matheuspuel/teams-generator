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
  R,
  Rec,
  RIO,
  S,
  some,
  Str,
  Tup,
} from 'fp'
import { not } from 'fp-ts/Predicate'
import { memoized, memoizedConst } from 'src/components/helpers'
import {
  FlatList,
  Fragment,
  Header,
  MaterialIcons,
  Modal,
  Pressable,
  Row,
  TextInput,
  Txt,
  TxtContext,
  View,
} from 'src/components/hyperscript'
import { Group } from 'src/datatypes'
import { RootState } from 'src/model'
import { root } from 'src/model/Optics'
import { execute, getSApp, replaceSApp } from 'src/services/StateRef'
import { Colors } from 'src/services/Theme'
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
} from 'src/slices/ui'
import { withOpacity } from 'src/utils/datatypes/Color'
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
    S.chain(() => replaceSApp(root.ui.selectedGroupId.$)(O.some(id))),
    execute,
  )

const onCloseGroupModal = execute(setUpsertGroupModal(none))

const onChangeGroupName = $f(setUpsertGroupName, execute)

const onSaveGroup = $(
  execute(getSApp(root.ui.modalUpsertGroup.$)),
  RIO.chain(
    $f(
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
  S.gets(Optic.get(root.ui.modalDeleteGroup.$)),
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
        ListEmptyComponent: View({ flex: 1, justify: 'center' })([
          Txt({ align: 'center', size: 16, color: Colors.gray.$3 })(
            'Nenhum grupo cadastrado',
          ),
        ]),
        contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
        initialNumToRender: 16,
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
  View({ bg: Colors.white })([
    Header({
      title: 'Grupos',
      headerStyle: { backgroundColor: Colors.primary.$5 },
      headerTitleStyle: { color: Colors.text.light },
      headerRight: Pressable({
        onPress: onOpenNewGroupModal,
        mr: 4,
        p: 8,
        borderless: true,
        foreground: true,
      })([MaterialIcons({ name: 'add', color: Colors.text.light, size: 24 })]),
    }),
  ]),
)

const Item = memoized('GroupItem')(
  Eq.struct({ name: Eq.eqStrict, id: Eq.eqStrict }),
  ({ name, id }: Group) =>
    Pressable({
      onPress: onSelectGroup(id),
      direction: 'row',
      align: 'center',
      p: 4,
      round: 8,
      shadow: 1,
      bg: Colors.white,
    })([
      Txt({
        numberOfLines: 1,
        flex: 1,
        p: 8,
        weight: 600,
        color: Colors.text.dark,
      })(name),
      Pressable({ onPress: onOpenEdit(id), borderless: true, py: 8, px: 4 })([
        MaterialIcons({ name: 'edit', size: 24, color: Colors.gray.$4 }),
      ]),
      Pressable({
        onPress: onOpenDelete(id),
        borderless: true,
        py: 8,
        px: 4,
      })([MaterialIcons({ name: 'delete', color: Colors.gray.$4, size: 24 })]),
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
        flex: 1,
        animationType: 'fade',
        statusBarTranslucent: true,
        onRequestClose: onCloseGroupModal,
      })([
        Pressable({
          onPress: onCloseGroupModal,
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
              Pressable({ onPress: onCloseGroupModal, p: 8, round: 4 })([
                MaterialIcons({
                  name: 'close',
                  size: 24,
                  color: Colors.gray.$4,
                }),
              ]),
            ]),
            View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
            View({ p: 16 })([
              Txt({ weight: 500, color: Colors.gray.$4, my: 4 })(
                'Nome do grupo',
              ),
              TextInput({
                placeholder: 'Ex: Futebol de quinta',
                value: form.name,
                onChange: onChangeGroupName,
                placeholderTextColor: Colors.gray.$3,
                cursorColor: Colors.text.dark,
                fontSize: 12,
                p: 8,
                px: 14,
                borderWidth: 1,
                round: 4,
                borderColor: Colors.gray.$2,
                focused: {
                  bg: $(Colors.primary.$5, R.map(withOpacity(31))),
                  borderColor: Colors.primary.$5,
                },
              }),
            ]),
            View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
            Row({ justify: 'end', p: 16 })([
              Pressable({
                onPress: onCloseGroupModal,
                mr: 8,
                p: 12,
                round: 4,
                rippleColor: Colors.primary.$5,
                rippleOpacity: 0.15,
              })([Txt({ color: Colors.primary.$5 })('Cancelar')]),
              Pressable({
                p: 12,
                round: 4,
                bg: !form.name
                  ? $(Colors.primary.$5, R.map(withOpacity(95)))
                  : Colors.primary.$5,
                onPress: onSaveGroup,
                isEnabled: !!form.name,
                rippleColor: Colors.black,
                rippleOpacity: 0.5,
              })([
                Txt({
                  color: !form.name
                    ? $(Colors.white, R.map(withOpacity(95)))
                    : Colors.white,
                })('Gravar'),
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
    flex: 1,
    animationType: 'fade',
    statusBarTranslucent: true,
    onRequestClose: onCloseDeleteModal,
  })([
    Pressable({
      onPress: onCloseDeleteModal,
      flex: 1,
      bg: $(Colors.black, R.map(withOpacity(63))),
      justify: 'center',
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
          })('Excluir grupo'),
          Pressable({ onPress: onCloseDeleteModal, p: 8, round: 4 })([
            MaterialIcons({ name: 'close', size: 24, color: Colors.gray.$4 }),
          ]),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        View({ p: 16 })(
          $(
            group,
            O.map(g =>
              TxtContext({ color: Colors.text.dark })([
                Txt()('Deseja excluir o grupo '),
                Txt({ weight: 600, color: Colors.text.dark })(g.name),
                Txt()(' e todos os jogadores?'),
              ]),
            ),
            A.fromOption,
          ),
        ),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        Row({ p: 16, justify: 'end' })([
          Pressable({
            mr: 8,
            p: 12,
            round: 4,
            rippleColor: Colors.danger.$5,
            rippleOpacity: 0.15,
            onPress: onCloseDeleteModal,
          })([Txt({ color: Colors.danger.$5 })('Cancelar')]),
          Pressable({
            p: 12,
            round: 4,
            bg: Colors.danger.$5,
            rippleColor: Colors.black,
            rippleOpacity: 0.5,
            onPress: onDeleteGroup,
          })([Txt({ color: Colors.white })('Excluir')]),
        ]),
      ]),
    ]),
  ])
