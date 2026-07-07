import * as Optic from '@fp-ts/optic'
import { Array, Effect, Option, Record, Schema, flow, pipe } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
import { Group, Modality, Player } from 'src/datatypes'
import {
  CustomModality,
  StaticModality,
  basketball,
  basketballPositions,
  futsal,
  futsalPositions,
  soccer,
  soccerPositions,
  staticModalities,
  volleyball,
  volleyballPositions,
} from 'src/datatypes/Modality'
import { Abbreviation, Position } from 'src/datatypes/Position'
import { RootState } from 'src/model'
import { root } from 'src/model/optic'
import { IdGenerator } from 'src/services/IdGenerator'
import { State } from 'src/services/StateRef'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = Schema.Record({
  key: Id.pipe(Schema.typeSchema),
  value: Group.Group,
})
export const GroupsState: Schema.Schema<
  GroupsState,
  Schema.Schema.Encoded<typeof GroupsState_>
> = GroupsState_

export const emptyGroups: GroupsState = {}

const refOnGroups = State.on(root.at('groups'))

export const getGroupsRecord = Optic.get(root.at('groups'))

export const getGroup = (group: { id: Id }) =>
  flow(getGroupsRecord, Record.get(group.id))

export const getModality =
  (modality: Modality.Reference) =>
  (state: RootState): Option.Option<Modality> =>
    modality._tag === 'StaticModality'
      ? Array.findFirst(staticModalities, _ => _.id === modality.id)
      : Array.findFirst(state.customModalities, _ => _.id === modality.id)

export const getGroupModality =
  (args: { group: { id: Id } }) => (s: RootState) =>
    pipe(
      getGroup(args.group)(s),
      Option.flatMap(g => getModality(g.modality)(s)),
    )

export const getPlayer =
  (args: { player: { id: Id }; group: { id: Id } }) => (s: RootState) =>
    pipe(
      getGroup(args.group)(s),
      Option.map(g => g.players),
      Option.flatMap(Array.findFirst(p => p.id === args.player.id)),
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
          Record.get(s.groups, args.id),
          Option.flatMap(prevGroup => getModality(prevGroup.modality)(s)),
        ),
      ),
    ),
    Effect.bind('nextModality', () =>
      State.flatWith(getModality(args.modality)),
    ),
    Effect.flatMap(({ prevModality, nextModality }) =>
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
                : Array.map(
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
  refOnGroups.update(Record.remove(args.id))

const addPlayer = (args: {
  group: { id: Id }
  player: Omit<Player, 'active'>
}) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(args.group.id, g => ({
        ...g,
        players: Array.append({ ...args.player, active: true })(g.players),
      })),
      Option.getOrElse(() => s),
    ),
  )

export const createPlayer = ({
  group,
  player,
}: {
  group: { id: Id }
  player: Omit<Player, 'active' | 'id' | 'createdAt'>
}) =>
  pipe(
    Effect.all({ id: IdGenerator.generate(), time: Timestamp.now }),
    Effect.flatMap(({ id, time }) =>
      addPlayer({ group, player: { ...player, id, createdAt: time } }),
    ),
  )

export const editPlayer = (p: {
  group: { id: Id }
  player: Omit<Player, 'active' | 'createdAt'>
}) =>
  refOnGroups.update(s =>
    pipe(
      s,
      Record.modifyOption(p.group.id, g => ({
        ...g,
        players: pipe(
          g.players,
          Array.map(a =>
            a.id === p.player.id
              ? { ...p.player, active: a.active, createdAt: a.createdAt }
              : a,
          ),
        ),
      })),
      Option.getOrElse(() => s),
    ),
  )

export const togglePlayerActive = (args: {
  group: { id: Id }
  player: { id: Id }
}) =>
  pipe(
    State.onOption(
      root
        .at('groups')
        .key(args.group.id)
        .at('players')
        .compose(Optic.findFirst(p => p.id === args.player.id))
        .at('active'),
    ).update(a => !a),
    Effect.ignore,
  )

export const toggleAllPlayersActive =
  (args: { group: { id: Id } }) => (s: RootState) =>
    pipe(
      s.groups,
      Record.get(args.group.id),
      Option.match({
        onNone: () => s,
        onSome: g =>
          pipe(
            g.players,
            Array.every(p => p.active),
            allActive =>
              pipe(
                g.players,
                Array.map(p => ({ ...p, active: !allActive })),
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
        ? positionAbbreviation === soccerPositions.z.abbreviation
          ? Option.some(futsalPositions.f)
          : positionAbbreviation === soccerPositions.le.abbreviation
            ? Option.some(futsalPositions.ae)
            : positionAbbreviation === soccerPositions.ld.abbreviation
              ? Option.some(futsalPositions.ad)
              : positionAbbreviation === soccerPositions.v.abbreviation
                ? Option.some(futsalPositions.f)
                : positionAbbreviation === soccerPositions.m.abbreviation
                  ? Option.some(futsalPositions.p)
                  : positionAbbreviation === soccerPositions.a.abbreviation
                    ? Option.some(futsalPositions.p)
                    : Option.none()
        : args.previous.id === futsal.id && args.next.id === soccer.id
          ? positionAbbreviation === futsalPositions.f.abbreviation
            ? Option.some(soccerPositions.z)
            : positionAbbreviation === futsalPositions.ae.abbreviation
              ? Option.some(soccerPositions.le)
              : positionAbbreviation === futsalPositions.ad.abbreviation
                ? Option.some(soccerPositions.ld)
                : positionAbbreviation === futsalPositions.p.abbreviation
                  ? Option.some(soccerPositions.a)
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
          ? Array.findFirst(args.nextModality.modality.positions, pos =>
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
        Array.findFirst(
          args.nextModality.modality.positions,
          pos => pos.abbreviation === player.positionAbbreviation,
        ),
      ),
      Option.orElse<Position>(() =>
        args.nextModality._tag === 'unchanged' &&
        args.nextModality.modality._tag === 'StaticModality'
          ? args.nextModality.modality.id === soccer.id
            ? Option.some(soccerPositions.a)
            : args.nextModality.modality.id === futsal.id
              ? Option.some(futsalPositions.p)
              : args.nextModality.modality.id === basketball.id
                ? Option.some(basketballPositions.c)
                : args.nextModality.modality.id === volleyball.id
                  ? Option.some(volleyballPositions.l)
                  : Option.none()
          : Option.none(),
      ),
      Option.getOrElse(() => args.nextModality.modality.positions[0]),
      _ => _.abbreviation,
    ),
  })
