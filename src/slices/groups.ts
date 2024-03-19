import { Schema } from '@effect/schema'
import * as Optic from '@fp-ts/optic'
import {
  Effect,
  Option,
  ReadonlyArray,
  ReadonlyRecord,
  flow,
  pipe,
} from 'effect'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
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
import { Timestamp } from 'src/utils/datatypes'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = Schema.record(Id.pipe(Schema.typeSchema), Group.Group)
export const GroupsState: Schema.Schema<
  GroupsState,
  Schema.Schema.Encoded<typeof GroupsState_>
> = GroupsState_

export const emptyGroups: GroupsState = {}

const refOnGroups = State.on(root.at('groups'))

export const getGroupsRecord = Optic.get(root.at('groups'))

export const getGroupById = (id: Id) =>
  flow(getGroupsRecord, ReadonlyRecord.get(id))

export const getSelectedGroup = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    Option.flatMap(id => getGroupById(id)(s)),
  )

export const getModality =
  (modality: Modality.Reference) =>
  (state: RootState): Option.Option<Modality> =>
    modality._tag === 'StaticModality'
      ? ReadonlyArray.findFirst(staticModalities, _ => _.id === modality.id)
      : ReadonlyArray.findFirst(
          state.customModalities,
          _ => _.id === modality.id,
        )

export const getActiveModality = (s: RootState) =>
  pipe(
    getSelectedGroup(s),
    Option.flatMap(g => getModality(g.modality)(s)),
  )

export const getPlayerFromSelectedGroup =
  (args: { playerId: Id }) => (s: RootState) =>
    pipe(
      getSelectedGroup(s),
      Option.map(g => g.players),
      Option.flatMap(ReadonlyArray.findFirst(p => p.id === args.playerId)),
    )

const addGroup = (group: Group) =>
  refOnGroups.update(gs => ({ ...gs, [group.id]: group }))

export const createGroup = (data: {
  name: string
  modality: Modality.Reference
}) =>
  pipe(
    IdGenerator.generate(),
    Effect.flatMap(id =>
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
    Effect.Do,
    Effect.bind('prevModality', () =>
      State.with(s =>
        pipe(
          ReadonlyRecord.get(s.groups, args.id),
          Option.flatMap(prevGroup => getModality(prevGroup.modality)(s)),
        ),
      ),
    ),
    Effect.bind('nextModality', () =>
      State.with(getModality(args.modality)).pipe(Effect.flatten),
    ),
    Effect.flatMap(({ prevModality, nextModality }) =>
      refOnGroups.update(s =>
        pipe(
          s,
          ReadonlyRecord.modifyOption(args.id, g => ({
            id: g.id,
            name: args.name,
            modality: args.modality,
            players:
              args.modality.id === g.modality.id
                ? g.players
                : ReadonlyArray.map(
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
          Option.getOrElse(() => s),
        ),
      ),
    ),
  )

export const addImportedGroup = (group: Omit<Group, 'id'>) =>
  pipe(
    IdGenerator.generate(),
    Effect.flatMap(id => addGroup({ ...group, id })),
  )

export const deleteGroup = (args: { id: Id }) =>
  refOnGroups.update(ReadonlyRecord.remove(args.id))

const addPlayer = (args: { groupId: Id; player: Omit<Player, 'active'> }) =>
  refOnGroups.update(s =>
    pipe(
      s,
      ReadonlyRecord.modifyOption(args.groupId, g => ({
        ...g,
        players: ReadonlyArray.append({ ...args.player, active: true })(
          g.players,
        ),
      })),
      Option.getOrElse(() => s),
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
    Effect.all({ id: IdGenerator.generate(), time: Timestamp.now }),
    Effect.flatMap(({ id, time }) =>
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
      ReadonlyRecord.modifyOption(p.groupId, g => ({
        ...g,
        players: pipe(
          g.players,
          ReadonlyArray.map(a =>
            a.id === p.player.id
              ? { ...p.player, active: a.active, createdAt: a.createdAt }
              : a,
          ),
        ),
      })),
      Option.getOrElse(() => s),
    ),
  )

export const deleteCurrentPlayer = (s: RootState) =>
  pipe(
    Option.all({
      groupId: s.ui.selectedGroupId,
      playerId: s.ui.selectedPlayerId,
    }),
    Option.map(({ groupId, playerId }) =>
      Optic.modify(root.at('groups').key(groupId).at('players'))(
        ReadonlyArray.filter(p => p.id !== playerId),
      )(s),
    ),
    Option.getOrElse(() => s),
  )

export const togglePlayerActive = ({ playerId }: { playerId: Id }) =>
  pipe(
    State.on(root.at('ui').at('selectedGroupId')).get,
    Effect.flatten,
    Effect.flatMap(groupId =>
      State.onOption(
        root
          .at('groups')
          .key(groupId)
          .at('players')
          .compose(Optic.findFirst(p => p.id === playerId))
          .at('active'),
      ).update(a => !a),
    ),
    Effect.ignore,
  )

export const toggleAllPlayersActive = (s: RootState) =>
  pipe(
    s.ui.selectedGroupId,
    Option.flatMap(id => pipe(s.groups, ReadonlyRecord.get(id))),
    Option.match({
      onNone: () => s,
      onSome: g =>
        pipe(
          g.players,
          ReadonlyArray.every(p => p.active),
          allActive =>
            pipe(
              g.players,
              ReadonlyArray.map(p => ({ ...p, active: !allActive })),
            ),
          Optic.replace(root.at('groups').key(g.id).at('players')),
          f => f(s),
        ),
    }),
  )

const adaptStaticModalitiesPosition =
  (args: { previous: StaticModality; next: StaticModality }) =>
  (positionAbbreviation: Abbreviation): Option.Option<Position> =>
    args.previous.id === args.next.id
      ? Option.none()
      : args.previous.id === soccer.id && args.next.id === futsal.id
        ? positionAbbreviation === soccer.positions[1].abbreviation
          ? Option.some(futsal.positions[1])
          : positionAbbreviation === soccer.positions[2].abbreviation
            ? Option.some(futsal.positions[2])
            : positionAbbreviation === soccer.positions[3].abbreviation
              ? Option.some(futsal.positions[3])
              : positionAbbreviation === soccer.positions[4].abbreviation
                ? Option.some(futsal.positions[1])
                : positionAbbreviation === soccer.positions[5].abbreviation
                  ? Option.some(futsal.positions[4])
                  : positionAbbreviation === soccer.positions[6].abbreviation
                    ? Option.some(futsal.positions[4])
                    : Option.none()
        : args.previous.id === futsal.id && args.next.id === soccer.id
          ? positionAbbreviation === futsal.positions[1].abbreviation
            ? Option.some(soccer.positions[1])
            : positionAbbreviation === futsal.positions[2].abbreviation
              ? Option.some(soccer.positions[2])
              : positionAbbreviation === futsal.positions[3].abbreviation
                ? Option.some(soccer.positions[3])
                : positionAbbreviation === futsal.positions[4].abbreviation
                  ? Option.some(soccer.positions[6])
                  : Option.none()
          : Option.none()

export const adjustPlayerPosition =
  (args: {
    prevModality: Option.Option<Modality>
    nextModality:
      | { _tag: 'unchanged'; modality: StaticModality | CustomModality }
      | {
          _tag: 'edited'
          modality: CustomModality & {
            positions: NonEmptyReadonlyArray<
              Position & { oldAbbreviation: Option.Option<Abbreviation> }
            >
          }
        }
  }) =>
  (player: Player) => ({
    ...player,
    positionAbbreviation: pipe(
      args.prevModality,
      Option.flatMap(prevModality =>
        args.nextModality._tag === 'edited'
          ? ReadonlyArray.findFirst(args.nextModality.modality.positions, pos =>
              Option.match(pos.oldAbbreviation, {
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
            : Option.none(),
      ),
      Option.orElse(() =>
        ReadonlyArray.findFirst(
          args.nextModality.modality.positions,
          pos => pos.abbreviation === player.positionAbbreviation,
        ),
      ),
      Option.orElse<Position>(() =>
        args.nextModality._tag === 'unchanged' &&
        args.nextModality.modality._tag === 'StaticModality'
          ? args.nextModality.modality.id === soccer.id
            ? Option.some(soccer.positions[6])
            : args.nextModality.modality.id === futsal.id
              ? Option.some(futsal.positions[4])
              : args.nextModality.modality.id === basketball.id
                ? Option.some(basketball.positions[4])
                : args.nextModality.modality.id === volleyball.id
                  ? Option.some(volleyball.positions[0])
                  : Option.none()
          : Option.none(),
      ),
      Option.getOrElse(() => args.nextModality.modality.positions[0]),
      _ => _.abbreviation,
    ),
  })
