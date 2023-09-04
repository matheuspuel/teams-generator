import { $, A, Eq, O, Option, R, Rec, Tup } from 'fp'
import {
  FlatList,
  Fragment,
  Header,
  Input,
  MaterialCommunityIcons,
  MaterialIcons,
  Nothing,
  Pressable,
  Row,
  Txt,
  TxtContext,
  View,
} from 'src/components'
import { CenterModal } from 'src/components/derivative/CenterModal'
import { HeaderButton } from 'src/components/derivative/HeaderButton'
import { HeaderButtonRow } from 'src/components/derivative/HeaderButtonRow'
import { HeaderMenu } from 'src/components/derivative/HeaderMenu'
import { HeaderMenuButton } from 'src/components/derivative/HeaderMenuButton'
import { memoized, memoizedConst } from 'src/components/helpers'
import { Group } from 'src/datatypes'
import { appEvents } from 'src/events'
import { RootState } from 'src/model'
import { Colors } from 'src/services/Theme'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { withOpacity } from 'src/utils/datatypes/Color'

const on = appEvents.groups

export const Groups = memoized('Groups')(
  Eq.struct({
    ui: Eq.struct({
      modalDeleteGroup: Eq.strict(),
      modalUpsertGroup: Eq.strict(),
      homeMenu: Eq.strict(),
    }),
    groups: Eq.mapInput(Eq.number, (a: GroupsState) => Rec.size(a)),
  }),
  ({
    ui: { modalDeleteGroup, modalUpsertGroup, homeMenu },
    groups,
  }: {
    ui: RootState['ui']
    groups: GroupsState
  }) =>
    View({ flex: 1, onLayout: appEvents.core.uiMount() })([
      ScreenHeader,
      FlatList({
        data: $(
          groups,
          Rec.toEntries,
          A.map(Tup.getSecond),
          A.sort(Group.NameOrd),
        ),
        renderItem: Item,
        ListEmptyComponent: View({ flex: 1, justify: 'center' })([
          Txt({ align: 'center', size: 16, color: Colors.gray.$3 })(
            'Nenhum grupo cadastrado',
          ),
        ]),
        contentContainerStyle: { flexGrow: 1, p: 8, gap: 8 },
        initialNumToRender: 16,
      }),
      homeMenu ? Menu : Nothing,
      GroupModal({ state: modalUpsertGroup }),
      DeleteGroupModal({
        state: modalDeleteGroup,
        group: $(
          modalDeleteGroup,
          O.map(({ id }) => id),
          O.flatMap(id => $(groups, Rec.get(id))),
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
      headerRight: HeaderButtonRow([
        HeaderButton({
          onPress: on.item.upsert.new(),
          icon: MaterialIcons({ name: 'add' }),
        }),
        HeaderButton({
          onPress: on.menu.open(),
          icon: MaterialIcons({ name: 'more-vert' }),
        }),
      ]),
    }),
  ]),
)

const Menu = HeaderMenu({ onClose: on.menu.close() })([
  HeaderMenuButton({
    onPress: on.import(),
    label: 'Importar grupo',
    icon: MaterialCommunityIcons({ name: 'import' }),
  }),
])

const Item = memoized('GroupItem')(
  Eq.struct({ name: Eq.strict(), id: Eq.strict() }),
  ({ name, id }: Group) =>
    Pressable({
      onPress: on.item.open(id),
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
      Pressable({
        onPress: on.item.upsert.edit(id),
        borderless: true,
        py: 8,
        px: 4,
      })([MaterialIcons({ name: 'edit', color: Colors.gray.$4 })]),
      Pressable({
        onPress: on.item.delete.open(id),
        borderless: true,
        py: 8,
        px: 4,
      })([MaterialIcons({ name: 'delete', color: Colors.gray.$4 })]),
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
      CenterModal({
        onClose: on.item.upsert.close(),
        title: $(
          state,
          O.flatMap(s => s.id),
          O.match({
            onNone: () => 'Novo grupo',
            onSome: () => 'Editar grupo',
          }),
        ),
      })([
        View({ p: 16 })([
          Txt({ weight: 500, color: Colors.gray.$4, my: 4 })('Nome do grupo'),
          Input({
            placeholder: 'Ex: Futebol de quinta',
            value: form.name,
            onChange: on.item.upsert.form.name.change,
            autoFocus: true,
          }),
        ]),
        View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
        Row({ justify: 'end', p: 16 })([
          Pressable({
            onPress: on.item.upsert.close(),
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
            onPress: on.item.upsert.submit(),
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
    ),
    O.getOrElse(() => Fragment([])),
  )

const DeleteGroupModal = ({
  group,
  state,
}: {
  state: Option<{ id: Id }>
  group: Option<Group>
}) =>
  CenterModal({
    onClose: on.item.delete.close(),
    visible: O.isSome(state),
    title: 'Excluir grupo',
  })([
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
    Row({ p: 16, gap: 8, justify: 'end' })([
      Pressable({
        p: 12,
        round: 4,
        rippleColor: Colors.danger.$5,
        rippleOpacity: 0.15,
        onPress: on.item.delete.close(),
      })([Txt({ color: Colors.danger.$5 })('Cancelar')]),
      Pressable({
        p: 12,
        round: 4,
        bg: Colors.danger.$5,
        rippleColor: Colors.black,
        rippleOpacity: 0.5,
        onPress: on.item.delete.submit(),
      })([Txt({ color: Colors.white })('Excluir')]),
    ]),
  ])
