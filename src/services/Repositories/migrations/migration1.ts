import { Schema } from '@effect/schema'
import {
  Array,
  Effect,
  Option,
  Order,
  Record,
  String,
  identity,
  pipe,
} from 'effect'
import { Rating } from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'
import { Player } from 'src/datatypes/Player'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
import { createStorage } from 'src/utils/storage'
import { Repository } from '..'

type PositionV2 = Schema.Schema.Type<typeof PositionV2>
const PositionV2 = Schema.Literal('G', 'Z', 'LE', 'LD', 'M', 'A')

const GroupsV1 = Schema.Record(
  Id.pipe(Schema.typeSchema),
  Schema.Struct({
    id: Id,
    name: Schema.String,
    players: Schema.Array(
      Schema.Struct({
        id: Id,
        name: Schema.String,
        rating: Rating.Rating,
        position: PositionV2,
        active: Schema.Boolean,
      }),
    ),
  }),
).pipe(Schema.encodedSchema)

const GroupsV2 = Schema.Record(
  Id.pipe(Schema.typeSchema),
  Schema.Struct({
    id: Id,
    name: Schema.String,
    players: Schema.Array(
      Schema.Struct({
        id: Id,
        name: Schema.String,
        rating: Rating.Rating,
        position: PositionV2,
        active: Schema.Boolean,
        createdAt: Timestamp.Timestamp,
      }),
    ),
  }),
)

const oldGroupsSchema = Schema.Union(
  GroupsV2,
  Schema.transform(GroupsV1, GroupsV2, {
    decode: gs =>
      Record.map(gs, g => ({
        ...g,
        players: pipe(
          g.players,
          Array.sort(Order.mapInput(String.Order, (p: { id: string }) => p.id)),
          Array.map((p, i) => ({
            ...p,
            createdAt: Timestamp.Timestamp(i),
          })),
        ),
      })),
    encode: identity,
  }),
)

const schemaWithMigrations = Schema.transform(
  oldGroupsSchema,
  GroupsState.pipe(Schema.typeSchema),
  {
    strict: false,
    decode: (gs): GroupsState =>
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
              Array.findFirst(
                pos => pos.abbreviation === p.position.toLowerCase(),
              ),
              Option.getOrElse(() => soccer.positions[6]),
              _ => _.abbreviation,
            ),
          }),
        ),
      })),
    encode: _ => _,
  },
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
  Effect.asVoid,
)
