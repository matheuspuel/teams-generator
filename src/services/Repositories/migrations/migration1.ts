import { A, Effect, F, O, Ord, Record, String, Tuple, identity, pipe } from 'fp'
import { Modality, Position, Rating } from 'src/datatypes'
import { Player } from 'src/datatypes/Player'
import { IdGenerator } from 'src/services/IdGenerator'
import { Repository } from 'src/services/Repositories'
import { GroupsState } from 'src/slices/groups'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
import { NonEmptyString } from 'src/utils/datatypes/NonEmptyString'
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

const schemaWithMigrations = (args: { soccer: Modality }) =>
  S.transform(
    oldGroupsSchema,
    GroupsState.pipe(S.to),
    (gs): GroupsState =>
      Record.map(gs, g => ({
        id: g.id,
        name: g.name,
        modalityId: args.soccer.id,
        players: g.players.map(
          (p): Player => ({
            id: p.id,
            name: p.name,
            rating: p.rating,
            active: p.active,
            createdAt: p.createdAt,
            positionId: pipe(
              args.soccer.positions,
              A.findFirst(pos => pos.abbreviation === p.position.toLowerCase()),
              O.getOrElse(() => args.soccer.positions[0]),
              _ => _.id,
            ),
          }),
        ),
      })),
    _ => _,
  )

const createPosition = (
  data: Omit<Position, 'id'>,
): Effect<IdGenerator, never, Position> =>
  F.map(IdGenerator.generate(), id => ({ ...data, id }))

const createModality = (
  data: Omit<Modality, 'id'>,
): Effect<IdGenerator, never, Modality> =>
  F.map(IdGenerator.generate(), id => ({ ...data, id }))

const soccer: Effect<IdGenerator, never, Modality> = pipe(
  F.all([
    createPosition({
      abbreviation: Position.Abbreviation('g'),
      name: NonEmptyString('Goleiro'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('z'),
      name: NonEmptyString('Zagueiro'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('le'),
      name: NonEmptyString('Lateral Esquerdo'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('ld'),
      name: NonEmptyString('Lateral Direito'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('v'),
      name: NonEmptyString('Volante'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('m'),
      name: NonEmptyString('Meia'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('a'),
      name: NonEmptyString('Atacante'),
    }),
  ]),
  F.flatMap(positions =>
    createModality({
      name: NonEmptyString('Futebol'),
      positions,
    }),
  ),
)

const indoorSoccer: Effect<IdGenerator, never, Modality> = pipe(
  F.all([
    createPosition({
      abbreviation: Position.Abbreviation('g'),
      name: NonEmptyString('Goleiro'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('f'),
      name: NonEmptyString('Fixo'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('ae'),
      name: NonEmptyString('Ala Esquerdo'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('ad'),
      name: NonEmptyString('Ala Direito'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('p'),
      name: NonEmptyString('Pivô'),
    }),
  ]),
  F.flatMap(positions =>
    createModality({
      name: NonEmptyString('Futsal'),
      positions,
    }),
  ),
)

const volleyball: Effect<IdGenerator, never, Modality> = pipe(
  F.all([
    createPosition({
      abbreviation: Position.Abbreviation('l'),
      name: NonEmptyString('Levantador'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('p'),
      name: NonEmptyString('Ponteiro'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('o'),
      name: NonEmptyString('Oposto'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('c'),
      name: NonEmptyString('Central'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('li'),
      name: NonEmptyString('Líbero'),
    }),
  ]),
  F.flatMap(positions =>
    createModality({
      name: NonEmptyString('Vôlei'),
      positions,
    }),
  ),
)

const basketball: Effect<IdGenerator, never, Modality> = pipe(
  F.all([
    createPosition({
      abbreviation: Position.Abbreviation('pg'),
      name: NonEmptyString('Point Guard'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('sg'),
      name: NonEmptyString('Shooting Guard'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('sf'),
      name: NonEmptyString('Small Forward'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('pf'),
      name: NonEmptyString('Power Forward'),
    }),
    createPosition({
      abbreviation: Position.Abbreviation('c'),
      name: NonEmptyString('Center'),
    }),
  ]),
  F.flatMap(positions =>
    createModality({
      name: NonEmptyString('Basquete'),
      positions,
    }),
  ),
)

const oldGroupsStorage = createStorage({
  key: 'core/groups',
  schema: oldGroupsSchema,
})

export const migration1 = pipe(
  soccer,
  F.tap(soccer =>
    pipe(
      F.all([F.succeed(soccer), indoorSoccer, volleyball, basketball]),
      F.tap(Repository.teams.Modality.set),
    ),
  ),
  F.tap(soccer =>
    pipe(
      oldGroupsStorage.get(),
      F.flatMap(S.decode(schemaWithMigrations({ soccer }))),
      F.tap(Repository.teams.Groups.set),
      F.ignore,
    ),
  ),
  F.tap(() => Repository.metadata.StorageVersion.set({ version: 1 })),
  F.asUnit,
)
