import { A, D, Layer, Ord, Rec, Str, identity, pipe } from 'fp'
import { Position, Rating } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
import { createStorage } from 'src/utils/storage'
import { RepositoryEnvs } from '../..'

const key = 'core/groups'

const targetSchema = GroupsState

const version1 = D.record(
  Id.pipe(D.to),
  D.struct({
    id: Id,
    name: D.string,
    players: D.array(
      D.struct({
        id: Id,
        name: D.string,
        rating: Rating.Schema,
        position: Position.Schema,
        active: D.boolean,
      }),
    ),
  }),
).pipe(D.from)

const version2 = D.record(
  Id.pipe(D.to),
  D.struct({
    id: Id,
    name: D.string,
    players: D.array(
      D.struct({
        id: Id,
        name: D.string,
        rating: Rating.Schema,
        position: Position.Schema,
        active: D.boolean,
        createdAt: Timestamp.Schema,
      }),
    ),
  }),
)

const schemaWithMigrations = D.compose(
  D.union(
    version2,
    D.transform(
      version1,
      version2,
      gs =>
        Rec.map(gs, g => ({
          ...g,
          players: pipe(
            g.players,
            A.sort(Ord.mapInput(Str.Order, (p: { id: string }) => p.id)),
            A.map((p, i) => ({ ...p, createdAt: Timestamp.Schema(i) })),
          ),
        })),
      identity,
    ),
  ),
  targetSchema,
)

export const GroupsRepositoryLive = RepositoryEnvs.teams.groups
  .context(createStorage({ key: key, schema: schemaWithMigrations }))
  .pipe(Layer.succeedContext)
