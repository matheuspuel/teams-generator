import { A, Layer, Ord, Record, S, String, identity, pipe } from 'fp'
import { Position, Rating } from 'src/datatypes'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
import { createStorage } from 'src/utils/storage'
import { RepositoryEnvs } from '../..'

const key = 'core/groups'

const targetSchema = GroupsState

const version1 = S.record(
  Id.pipe(S.to),
  S.struct({
    id: Id,
    name: S.string,
    players: S.array(
      S.struct({
        id: Id,
        name: S.string,
        rating: Rating.Schema,
        position: Position.Schema,
        active: S.boolean,
      }),
    ),
  }),
).pipe(S.from)

const version2 = S.record(
  Id.pipe(S.to),
  S.struct({
    id: Id,
    name: S.string,
    players: S.array(
      S.struct({
        id: Id,
        name: S.string,
        rating: Rating.Schema,
        position: Position.Schema,
        active: S.boolean,
        createdAt: Timestamp.Schema,
      }),
    ),
  }),
)

const schemaWithMigrations = S.compose(
  S.union(
    version2,
    S.transform(
      version1,
      version2,
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
  ),
  targetSchema,
)

export const GroupsRepositoryLive = RepositoryEnvs.teams.groups
  .context(createStorage({ key: key, schema: schemaWithMigrations }))
  .pipe(Layer.succeedContext)
