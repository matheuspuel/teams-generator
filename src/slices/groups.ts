import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { A, Clock, F, O, Optic, Option, Record, S, flow, pipe } from 'fp'
import { Group, Modality, Player } from 'src/datatypes'
import {
  CustomModality,
  StaticModality,
  basketball,
  futsal,
  soccer,
  staticModalities,
  volleyball,
} from 'src/datatypes/Modality'
import { Abbreviation, Position } from 'src/datatypes/Position'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { IdGenerator } from 'src/services/IdGenerator'
import { State } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = S.record(Id.pipe(S.typeSchema), Group.Schema)
export const GroupsState: S.Schema<
  GroupsState,
  S.Schema.Encoded<typeof GroupsState_>
> = GroupsState_

export const emptyGroups: GroupsState = {}

const refOnGroups = State.on(root.at('groups'))

export const getGroupsRecord = Optic.get(root.at('groups'))

export const getGroupById = (id: Id) => flow(getGroupsRecord, Record.get(id))

export const getSelectedGroup = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    O.flatMap(id => getGroupById(id)(s)),
  )

export const getModality =
  (modality: Modality.Reference) =>
  (state: RootState): Option<Modality> =>
    modality._tag === 'StaticModality'
      ? A.findFirst(staticModalities, _ => _.id === modality.id)
      : A.findFirst(state.customModalities, _ => _.id === modality.id)

export const getActiveModality = (s: RootState) =>
  pipe(
    getSelectedGroup(s),
    O.flatMap(g => getModality(g.modality)(s)),
  )

export const getPlayerFromSelectedGroup =
  (args: { playerId: Id }) => (s: RootState) =>
    pipe(
      getSelectedGroup(s),
      O.map(g => g.players),
      O.flatMap(A.findFirst(p => p.id === args.playerId)),
    )

const addGroup = (group: Group) =>
  refOnGroups.update(gs => ({ ...gs, [group.id]: group }))

export const createGroup = (data: {
  name: string
  modality: Modality.Reference
}) =>
  pipe(
    IdGenerator.generate(),
    F.flatMap(id =>
      addGroup({
        id,
        name: data.name,
        modality: data.modality,
        players: [],
      }),
    ),
  )

export const editGroup = (args: {
  id: Id
  name: string
  modality: Modality.Reference
}) =>
  pipe(
    F.Do,
    F.bind('prevModality', () =>
      State.with(s =>
        pipe(
          Record.get(s.groups, args.id),
          O.flatMap(prevGroup => getModality(prevGroup.modality)(s)),
        ),
      ),
    ),
    F.bind('nextModality', () =>
      State.with(getModality(args.modality)).pipe(F.flatten),
    ),
    F.flatMap(({ prevModality, nextModality }) =>
      refOnGroups.update(s =>
        pipe(
          s,
          Record.modifyOption(args.id, g => ({
            id: g.id,
            name: args.name,
            modality: args.modality,
            players:
              args.modality.id === g.modality.id
                ? g.players
                : A.map(
                    g.players,
                    adjustPlayerPosition({
                      prevModality,
                      nextModality: {
                        _tag: 'unchanged',
                        modality: nextModality,
                      },
                    }),
                  ),
          })),
          O.getOrElse(() => s),
        ),
      ),
    ),
  )

export const addImportedGroup = (group: Omit<Group, 'id'>) =>
  pipe(
    IdGenerator.generate(),
    F.flatMap(id => addGroup({ ...group, id })),
  )

export const deleteGroup = (args: { id: Id }) =>
  refOnGroups.update(Record.remove(args.id))

const addPlayer = (args: { groupId: Id; player: Omit<Player, 'active'> }) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(args.groupId, g => ({
        ...g,
        players: A.append({ ...args.player, active: true })(g.players),
      })),
      O.getOrElse(() => s),
    ),
  )

export const createPlayer = ({
  groupId,
  player,
}: {
  groupId: Id
  player: Omit<Player, 'active' | 'id' | 'createdAt'>
}) =>
  pipe(
    F.all({ id: IdGenerator.generate(), time: Clock.currentTimeMillis }),
    F.flatMap(({ id, time }) =>
      addPlayer({ groupId, player: { ...player, id, createdAt: time } }),
    ),
  )

export const editPlayer = (p: {
  groupId: Id
  player: Omit<Player, 'active' | 'createdAt'>
}) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(p.groupId, g => ({
        ...g,
        players: pipe(
          g.players,
          A.map(a =>
            a.id === p.player.id
              ? { ...p.player, active: a.active, createdAt: a.createdAt }
              : a,
          ),
        ),
      })),
      O.getOrElse(() => s),
    ),
  )

export const deleteCurrentPlayer = (s: RootState) =>
  pipe(
    O.all({
      groupId: s.ui.selectedGroupId,
      playerId: s.ui.selectedPlayerId,
    }),
    O.map(({ groupId, playerId }) =>
      Optic.modify(root.at('groups').key(groupId).at('players'))(
        A.filter(p => p.id !== playerId),
      )(s),
    ),
    O.getOrElse(() => s),
  )

export const togglePlayerActive = ({ playerId }: { playerId: Id }) =>
  pipe(
    State.on(root.at('ui').at('selectedGroupId')).get,
    F.flatten,
    F.flatMap(groupId =>
      State.onOption(
        root
          .at('groups')
          .key(groupId)
          .at('players')
          .compose(Optic.findFirst(p => p.id === playerId))
          .at('active'),
      ).update(a => !a),
    ),
    F.ignore,
  )

export const toggleAllPlayersActive = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    O.flatMap(id => pipe(s.groups, Record.get(id))),
    O.match({
      onNone: () => s,
      onSome: g =>
        pipe(
          g.players,
          A.every(p => p.active),
          allActive =>
            pipe(
              g.players,
              A.map(p => ({ ...p, active: !allActive })),
            ),
          Optic.replace(root.at('groups').key(g.id).at('players')),
          f => f(s),
        ),
    }),
  )

const adaptStaticModalitiesPosition =
  (args: { previous: StaticModality; next: StaticModality }) =>
  (positionAbbreviation: Abbreviation): Option<Position> =>
    args.previous.id === args.next.id
      ? O.none()
      : args.previous.id === soccer.id && args.next.id === futsal.id
        ? positionAbbreviation === soccer.positions[1].abbreviation
          ? O.some(futsal.positions[1])
          : positionAbbreviation === soccer.positions[2].abbreviation
            ? O.some(futsal.positions[2])
            : positionAbbreviation === soccer.positions[3].abbreviation
              ? O.some(futsal.positions[3])
              : positionAbbreviation === soccer.positions[4].abbreviation
                ? O.some(futsal.positions[1])
                : positionAbbreviation === soccer.positions[5].abbreviation
                  ? O.some(futsal.positions[4])
                  : positionAbbreviation === soccer.positions[6].abbreviation
                    ? O.some(futsal.positions[4])
                    : O.none()
        : args.previous.id === futsal.id && args.next.id === soccer.id
          ? positionAbbreviation === futsal.positions[1].abbreviation
            ? O.some(soccer.positions[1])
            : positionAbbreviation === futsal.positions[2].abbreviation
              ? O.some(soccer.positions[2])
              : positionAbbreviation === futsal.positions[3].abbreviation
                ? O.some(soccer.positions[3])
                : positionAbbreviation === futsal.positions[4].abbreviation
                  ? O.some(soccer.positions[6])
                  : O.none()
          : O.none()

export const adjustPlayerPosition =
  (args: {
    prevModality: Option<Modality>
    nextModality:
      | { _tag: 'unchanged'; modality: StaticModality | CustomModality }
      | {
          _tag: 'edited'
          modality: CustomModality & {
            positions: NonEmptyReadonlyArray<
              Position & { oldAbbreviation: Option<Abbreviation> }
            >
          }
        }
  }) =>
  (player: Player) => ({
    ...player,
    positionAbbreviation: pipe(
      args.prevModality,
      O.flatMap(prevModality =>
        args.nextModality._tag === 'edited'
          ? A.findFirst(args.nextModality.modality.positions, pos =>
              O.match(pos.oldAbbreviation, {
                onNone: () => false,
                onSome: _ => _ === player.positionAbbreviation,
              }),
            )
          : args.nextModality.modality._tag === 'StaticModality' &&
              prevModality._tag === 'StaticModality'
            ? adaptStaticModalitiesPosition({
                previous: prevModality,
                next: args.nextModality.modality,
              })(player.positionAbbreviation)
            : O.none(),
      ),
      O.orElse(() =>
        A.findFirst(
          args.nextModality.modality.positions,
          pos => pos.abbreviation === player.positionAbbreviation,
        ),
      ),
      O.orElse<Position>(() =>
        args.nextModality._tag === 'unchanged' &&
        args.nextModality.modality._tag === 'StaticModality'
          ? args.nextModality.modality.id === soccer.id
            ? O.some(soccer.positions[6])
            : args.nextModality.modality.id === futsal.id
              ? O.some(futsal.positions[4])
              : args.nextModality.modality.id === basketball.id
                ? O.some(basketball.positions[4])
                : args.nextModality.modality.id === volleyball.id
                  ? O.some(volleyball.positions[0])
                  : O.none()
          : O.none(),
      ),
      O.getOrElse(() => args.nextModality.modality.positions[0]),
      _ => _.abbreviation,
    ),
  })
