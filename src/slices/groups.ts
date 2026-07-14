import { Array, Option, Schema, pipe } from 'effect'
import { Group, type Modality, type Player } from 'src/datatypes'
import {
  type CustomModality,
  type StaticModality,
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
import type { Abbreviation, Position } from 'src/datatypes/Position'
import type { RootState } from 'src/state'
import { Id } from 'src/utils/Entity'

export type GroupsState = { [groupId: Id]: Group }
const GroupsState_ = Schema.Record({
  key: Id.pipe(Schema.typeSchema),
  value: Group.Group,
})
export const GroupsState: Schema.Schema<
  GroupsState,
  Schema.Schema.Encoded<typeof GroupsState_>
> = GroupsState_

export const getModality =
  (modality: Modality.Reference) =>
  (state: RootState): Modality | null =>
    (modality._tag === 'StaticModality'
      ? staticModalities.find(_ => _.id === modality.id)
      : state.customModalities.find(_ => _.id === modality.id)) ?? null

export const getGroupModality =
  (args: { group: { id: Id } }) => (s: RootState) =>
    pipe(s.groups[args.group.id], g => (g ? getModality(g.modality)(s) : null))

export const getPlayer =
  (args: { player: { id: Id }; group: { id: Id } }) => (s: RootState) =>
    s.groups[args.group.id]?.players.find(p => p.id === args.player.id) ?? null

const adaptStaticModalitiesPosition =
  (args: { previous: StaticModality; next: StaticModality }) =>
  (positionAbbreviation: Abbreviation): Position | null =>
    args.previous.id === args.next.id
      ? null
      : args.previous.id === soccer.id && args.next.id === futsal.id
        ? positionAbbreviation === soccerPositions.z.abbreviation
          ? futsalPositions.f
          : positionAbbreviation === soccerPositions.le.abbreviation
            ? futsalPositions.ae
            : positionAbbreviation === soccerPositions.ld.abbreviation
              ? futsalPositions.ad
              : positionAbbreviation === soccerPositions.v.abbreviation
                ? futsalPositions.f
                : positionAbbreviation === soccerPositions.m.abbreviation
                  ? futsalPositions.p
                  : positionAbbreviation === soccerPositions.a.abbreviation
                    ? futsalPositions.p
                    : null
        : args.previous.id === futsal.id && args.next.id === soccer.id
          ? positionAbbreviation === futsalPositions.f.abbreviation
            ? soccerPositions.z
            : positionAbbreviation === futsalPositions.ae.abbreviation
              ? soccerPositions.le
              : positionAbbreviation === futsalPositions.ad.abbreviation
                ? soccerPositions.ld
                : positionAbbreviation === futsalPositions.p.abbreviation
                  ? soccerPositions.a
                  : null
          : null

export const adjustPlayerPosition =
  (args: {
    prevModality: Modality | null
    nextModality:
      | { _tag: 'unchanged'; modality: StaticModality | CustomModality }
      | {
          _tag: 'edited'
          modality: CustomModality & {
            // TODO NonEmptyReadonlyArray
            positions: ReadonlyArray<
              Position & { oldAbbreviation: Abbreviation | null }
            >
          }
        }
  }) =>
  (player: Player) => ({
    ...player,
    positionAbbreviation: pipe(
      args.prevModality,
      prevModality =>
        prevModality === null
          ? null
          : args.nextModality._tag === 'edited'
            ? Array.findFirst(args.nextModality.modality.positions, pos =>
                pos.oldAbbreviation === null
                  ? false
                  : pos.oldAbbreviation === player.positionAbbreviation,
              ).pipe(Option.getOrNull)
            : args.nextModality.modality._tag === 'StaticModality' &&
                prevModality._tag === 'StaticModality'
              ? adaptStaticModalitiesPosition({
                  previous: prevModality,
                  next: args.nextModality.modality,
                })(player.positionAbbreviation)
              : null,
      v =>
        v ??
        args.nextModality.modality.positions.find(
          pos => pos.abbreviation === player.positionAbbreviation,
        ) ??
        null,
      v =>
        v ??
        (args.nextModality._tag === 'unchanged' &&
        args.nextModality.modality._tag === 'StaticModality'
          ? args.nextModality.modality.id === soccer.id
            ? soccerPositions.a
            : args.nextModality.modality.id === futsal.id
              ? futsalPositions.p
              : args.nextModality.modality.id === basketball.id
                ? basketballPositions.c
                : args.nextModality.modality.id === volleyball.id
                  ? volleyballPositions.l
                  : null
          : null),
      _ => _ ?? args.nextModality.modality.positions[0],
      _ => _.abbreviation,
    ),
  })
