import { Semigroup } from '@effect/typeclass'
import {
  Arbitrary,
  Array,
  Effect,
  Equivalence,
  Match,
  identity,
  pipe,
} from 'effect'
import { constant } from 'effect/Function'
import * as fc from 'fast-check'
import { playersMock } from 'src/mocks/Player'
import { getCombinationsIndices } from 'src/utils/Combinations'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
import { getUnorderedEquivalence } from 'src/utils/fp/Array'
import { toEquivalence } from 'src/utils/fp/Order'
import { combineAllNonEmpty } from 'src/utils/fp/Semigroup'
import { describe, expect, test } from 'vitest'
import { Player } from '.'
import { soccer } from './Modality'
import { Abbreviation } from './Position'
import { distributeTeams, getFitOrdFromCriteria } from './TeamsGenerator'

const modality = soccer

const getAllCombinationsOfSubListsWithEqualLength =
  (numOfLists: number) =>
  <A>(as: Array<A>): Array<Array<Array<A>>> =>
    numOfLists <= 1
      ? [[as]]
      : pipe(
          getCombinationsIndices(Math.floor(as.length / numOfLists))(
            Array.length(as),
          ),
          Array.map(is =>
            pipe(
              as,
              Array.partition((_, i) => is.includes(i)),
              ([cs, bs]) =>
                pipe(
                  getAllCombinationsOfSubListsWithEqualLength(numOfLists - 1)(
                    cs,
                  ),
                  Array.map(Array.prepend(bs)),
                ),
            ),
          ),
          Array.flatten,
        )

const getAllCombinationsOfSubListsWithFixedLength =
  (listLength: number) =>
  <A>(as: Array<A>): Array<Array<Array<A>>> =>
    as.length <= listLength
      ? [[as]]
      : pipe(
          getCombinationsIndices(listLength)(as.length),
          Array.flatMap(is =>
            pipe(
              as,
              Array.partition((_, i) => is.includes(i)),
              ([bs, as]) =>
                pipe(
                  getAllCombinationsOfSubListsWithFixedLength(listLength)(bs),
                  Array.map(Array.prepend(as)),
                ),
            ),
          ),
        )

const distributeTeamsUsingCombinations: typeof distributeTeams = args =>
  Effect.sync(() =>
    pipe(
      args.criteria.distribution,
      Match.valueTags({
        numOfTeams: ({ numOfTeams }) =>
          getAllCombinationsOfSubListsWithEqualLength(numOfTeams)(args.players),
        fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
          getAllCombinationsOfSubListsWithFixedLength(fixedNumberOfPlayers)(
            args.players,
          ),
      }),
      Array.match({
        onEmpty: constant([]),
        onNonEmpty: combineAllNonEmpty(
          Semigroup.min(getFitOrdFromCriteria(args)),
        ),
      }),
    ),
  )

describe('test utils', () => {
  test('getAllCombinationsOfSubListsWithFixedLength', () => {
    expect(
      getAllCombinationsOfSubListsWithFixedLength(3)([1, 2, 3, 4]),
    ).toStrictEqual([
      [[1, 2, 3], [4]],
      [[1, 2, 4], [3]],
      [[1, 3, 4], [2]],
      [[2, 3, 4], [1]],
    ])
  })

  test('getAllTeamCombinationsWithEqualNumberOfPlayers', () => {
    expect(
      getAllCombinationsOfSubListsWithEqualLength(2)([1, 2, 3, 4]),
    ).toStrictEqual([
      [identity([1, 2]), identity([3, 4])],
      [identity([1, 3]), identity([2, 4])],
      [identity([1, 4]), identity([2, 3])],
      [identity([2, 3]), identity([1, 4])],
      [identity([2, 4]), identity([1, 3])],
      [identity([3, 4]), identity([1, 2])],
    ])
  })
})

describe('Balance teams', () => {
  const criteriaArb = fc.record({
    position: fc.boolean(),
    rating: fc.boolean(),
    distribution: fc.oneof(
      fc.record({
        _tag: fc.constant('numOfTeams' as const),
        numOfTeams: fc.integer({ min: 2, max: 9 }),
      }),
      fc.record({
        _tag: fc.constant('fixedNumberOfPlayers' as const),
        fixedNumberOfPlayers: fc.integer({ min: 1, max: 20 }),
      }),
    ),
  })
  const balanceTeamsArb = fc.record({
    criteria: criteriaArb,
    players: fc.array(Arbitrary.make(Player.Player)),
  })

  test.skip('should return the optimal solution', async () => {
    const playersCounterExample1: Array<Player> = [
      {
        active: false,
        id: Id.make(''),
        name: '',
        rating: 6.5,
        positionAbbreviation: Abbreviation.make('m'),
        createdAt: Timestamp.Timestamp.make(0),
      },
      {
        active: false,
        id: Id.make(''),
        name: '',
        rating: 3.5,
        positionAbbreviation: Abbreviation.make('m'),
        createdAt: Timestamp.Timestamp.make(0),
      },
      {
        active: false,
        id: Id.make(''),
        name: '',
        rating: 2.5,
        positionAbbreviation: Abbreviation.make('le'),
        createdAt: Timestamp.Timestamp.make(0),
      },
      {
        active: false,
        id: Id.make(''),
        name: '',
        rating: 3,
        positionAbbreviation: Abbreviation.make('m'),
        createdAt: Timestamp.Timestamp.make(0),
      },
      {
        active: false,
        id: Id.make(''),
        name: '',
        rating: 5,
        positionAbbreviation: Abbreviation.make('z'),
        createdAt: Timestamp.Timestamp.make(0),
      },
    ]
    await fc.assert(
      fc.asyncProperty(
        criteriaArb,
        fc.array(Arbitrary.make(Player.Player), {
          minLength: 1,
          maxLength: 8,
        }),
        async (criteria, players) =>
          pipe(getFitOrdFromCriteria({ modality, criteria }), async fitOrd =>
            toEquivalence(fitOrd)(
              await distributeTeams({ players, modality, criteria }).pipe(
                Effect.runPromise,
              ),
              distributeTeamsUsingCombinations({
                players,
                modality,
                criteria,
              }).pipe(Effect.runSync),
            ),
          ),
      ),
      {
        examples: [
          [
            {
              position: true,
              rating: true,
              distribution: { _tag: 'numOfTeams', numOfTeams: 2 },
            },
            playersCounterExample1,
          ],
        ],
      },
    )
  })

  test('should return the same players', async () => {
    await fc.assert(
      fc.asyncProperty(balanceTeamsArb, async ({ players, criteria }) =>
        pipe(
          await distributeTeams({ players, modality, criteria }).pipe(
            Effect.runPromise,
          ),
          Array.flatten,
          _ => getUnorderedEquivalence(Equivalence.strict())(_, players),
        ),
      ),
    )
  })

  test('should return the correct number of teams', async () => {
    await fc.assert(
      fc.asyncProperty(
        balanceTeamsArb,
        async ({ criteria, players }) =>
          (
            await distributeTeams({ players, modality, criteria }).pipe(
              Effect.runPromise,
            )
          ).length ===
          pipe(
            criteria.distribution,
            Match.valueTags({
              numOfTeams: ({ numOfTeams }) => numOfTeams,
              fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
                Math.ceil(players.length / fixedNumberOfPlayers),
            }),
          ),
      ),
    )
  })

  test('should return the correct number of players each team', async () => {
    await fc.assert(
      fc.asyncProperty(balanceTeamsArb, async ({ players, criteria }) =>
        (
          await distributeTeams({ players, modality, criteria }).pipe(
            Effect.runPromise,
          )
        ).every(
          (t, i, ts) =>
            t.length ===
            pipe(
              criteria.distribution,
              Match.valueTags({
                numOfTeams: ({ numOfTeams }) =>
                  Math.floor(players.length / numOfTeams) +
                  (players.length % numOfTeams > i ? 1 : 0),
                fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
                  i + 1 === ts.length
                    ? players.length % fixedNumberOfPlayers ||
                      fixedNumberOfPlayers
                    : fixedNumberOfPlayers,
              }),
            ),
        ),
      ),
    )
  })

  test('should not have teams with player count difference higher than one in any position', async () => {
    await fc.assert(
      fc.asyncProperty(balanceTeamsArb, async ({ criteria, players }) =>
        pipe(
          await distributeTeams({
            players,
            modality,
            criteria: { ...criteria, position: true },
          }).pipe(Effect.runPromise),
          teams =>
            teams.every(a =>
              teams.every(
                b =>
                  pipe(
                    criteria.distribution,
                    Match.valueTags({
                      fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
                        a.length !== fixedNumberOfPlayers ||
                        b.length !== fixedNumberOfPlayers,
                      numOfTeams: () => false,
                    }),
                  ) ||
                  pipe(
                    modality.positions,
                    Array.every(
                      pos =>
                        Math.abs(
                          a.filter(
                            p => p.positionAbbreviation === pos.abbreviation,
                          ).length -
                            b.filter(
                              p => p.positionAbbreviation === pos.abbreviation,
                            ).length,
                        ) <= 1,
                    ),
                  ),
              ),
            ),
        ),
      ),
    )
  })

  test('should return a balanced team', async () => {
    expect(
      await distributeTeams({
        players: playersMock,
        modality,
        criteria: {
          position: true,
          rating: true,
          distribution: { _tag: 'numOfTeams', numOfTeams: 3 },
        },
      }).pipe(Effect.runPromise),
    ).toMatchSnapshot()
    expect(
      await distributeTeams({
        players: playersMock,
        modality,
        criteria: {
          position: true,
          rating: true,
          distribution: {
            _tag: 'fixedNumberOfPlayers',
            fixedNumberOfPlayers: 7,
          },
        },
      }).pipe(Effect.runPromise),
    ).toMatchSnapshot()
  })
})
