import { A, F, O, Ord, Record, String, Tuple, identity, pipe } from 'fp'
import { Rating } from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'
import { Player } from 'src/datatypes/Player'
import { Repository } from 'src/services/Repositories'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
import { S } from 'src/utils/fp'
import { createStorage } from 'src/utils/storage'

const PositionDictV1 = {
  G: null,
  Z: null,
  LE: null,
  LD: null,
  M: null,
  A: null,
}

type PositionV2 = keyof typeof PositionDictV1

const PositionV2: S.Schema<PositionV2> = S.literal(
  ...pipe(PositionDictV1, Record.toEntries, A.map(Tuple.getFirst)),
)

const GroupsV1 = S.record(
  Id.pipe(S.to),
  S.struct({
    id: Id,
    name: S.string,
    players: S.array(
      S.struct({
        id: Id,
        name: S.string,
        rating: Rating.Schema,
        position: PositionV2,
        active: S.boolean,
      }),
    ),
  }),
).pipe(S.from)

const GroupsV2 = S.record(
  Id.pipe(S.to),
  S.struct({
    id: Id,
    name: S.string,
    players: S.array(
      S.struct({
        id: Id,
        name: S.string,
        rating: Rating.Schema,
        position: PositionV2,
        active: S.boolean,
        createdAt: Timestamp.Schema,
      }),
    ),
  }),
)

const oldGroupsSchema = S.union(
  GroupsV2,
  S.transform(
    GroupsV1,
    GroupsV2,
    gs =>
      Record.map(gs, g => ({
        ...g,
        players: pipe(
          g.players,
          A.sort(Ord.mapInput(String.Order, (p: { id: string }) => p.id)),
          A.map((p, i) => ({ ...p, createdAt: Timestamp.Schema(i) })),
        ),
      })),
    identity,
  ),
)

const schemaWithMigrations = S.transform(
  oldGroupsSchema,
  GroupsState.pipe(S.to),
  (gs): GroupsState =>
    Record.map(gs, g => ({
      id: g.id,
      name: g.name,
      modality: { _tag: 'StaticModality', id: soccer.id },
      players: g.players.map(
        (p): Player => ({
          id: p.id,
          name: p.name,
          rating: p.rating,
          active: p.active,
          createdAt: p.createdAt,
          positionAbbreviation: pipe(
            soccer.positions,
            A.findFirst(pos => pos.abbreviation === p.position.toLowerCase()),
            O.getOrElse(() => soccer.positions[6]),
            _ => _.abbreviation,
          ),
        }),
      ),
    })),
  _ => _,
)

const oldGroupsStorage = createStorage({
  key: 'core/groups',
  schema: oldGroupsSchema,
})

export const migration1 = pipe(
  pipe(
    oldGroupsStorage.get(),
    F.flatMap(S.decode(schemaWithMigrations)),
    F.tap(Repository.teams.Groups.set),
    F.ignore,
  ),
  F.tap(() => Repository.metadata.StorageVersion.set({ version: 1 })),
  F.asUnit,
)
