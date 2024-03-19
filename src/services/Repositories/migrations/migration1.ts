import { Schema } from '@effect/schema'
import {
  Effect,
  Option,
  Order,
  ReadonlyArray,
  ReadonlyRecord,
  String,
  Tuple,
  identity,
  pipe,
} from 'effect'
import { Rating } from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'
import { Player } from 'src/datatypes/Player'
import { Repository } from 'src/services/Repositories'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
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

const PositionV2: Schema.Schema<PositionV2> = Schema.literal(
  ...pipe(
    PositionDictV1,
    ReadonlyRecord.toEntries,
    ReadonlyArray.map(Tuple.getFirst),
  ),
)

const GroupsV1 = Schema.record(
  Id.pipe(Schema.typeSchema),
  Schema.struct({
    id: Id,
    name: Schema.string,
    players: Schema.array(
      Schema.struct({
        id: Id,
        name: Schema.string,
        rating: Rating.Rating,
        position: PositionV2,
        active: Schema.boolean,
      }),
    ),
  }),
).pipe(Schema.encodedSchema)

const GroupsV2 = Schema.record(
  Id.pipe(Schema.typeSchema),
  Schema.struct({
    id: Id,
    name: Schema.string,
    players: Schema.array(
      Schema.struct({
        id: Id,
        name: Schema.string,
        rating: Rating.Rating,
        position: PositionV2,
        active: Schema.boolean,
        createdAt: Timestamp.Timestamp,
      }),
    ),
  }),
)

const oldGroupsSchema = Schema.union(
  GroupsV2,
  Schema.transform(
    GroupsV1,
    GroupsV2,
    gs =>
      ReadonlyRecord.map(gs, g => ({
        ...g,
        players: pipe(
          g.players,
          ReadonlyArray.sort(
            Order.mapInput(String.Order, (p: { id: string }) => p.id),
          ),
          ReadonlyArray.map((p, i) => ({
            ...p,
            createdAt: Timestamp.Timestamp(i),
          })),
        ),
      })),
    identity,
  ),
)

const schemaWithMigrations = Schema.transform(
  oldGroupsSchema,
  GroupsState.pipe(Schema.typeSchema),
  (gs): GroupsState =>
    ReadonlyRecord.map(gs, g => ({
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
            ReadonlyArray.findFirst(
              pos => pos.abbreviation === p.position.toLowerCase(),
            ),
            Option.getOrElse(() => soccer.positions[6]),
            _ => _.abbreviation,
          ),
        }),
      ),
    })),
  _ => _,
  { strict: false },
)

const oldGroupsStorage = createStorage({
  key: 'core/groups',
  schema: oldGroupsSchema,
})

export const migration1 = pipe(
  pipe(
    oldGroupsStorage.get(),
    Effect.flatMap(Schema.decode(schemaWithMigrations)),
    Effect.tap(Repository.teams.Groups.set),
    Effect.ignore,
  ),
  Effect.tap(() => Repository.metadata.StorageVersion.set({ version: 1 })),
  Effect.asUnit,
)
