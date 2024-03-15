/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as fc from 'fast-check'
import { A, Eq, Match, Ord, Semigroup, constant, identity, pipe } from 'fp'
import { playersMock } from 'src/mocks/Player'
import { getCombinationsIndices } from 'src/utils/Combinations'
import { Id } from 'src/utils/Entity'
import { Timestamp } from 'src/utils/datatypes'
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
            A.length(as),
          ),
          A.map(is =>
            pipe(
              as,
              A.partition((_, i) => is.includes(i)),
              ([cs, bs]) =>
                pipe(
                  getAllCombinationsOfSubListsWithEqualLength(numOfLists - 1)(
                    cs,
                  ),
                  A.map(A.prepend(bs)),
                ),
            ),
          ),
          A.flatten,
        )

const getAllCombinationsOfSubListsWithFixedLength =
  (listLength: number) =>
  <A>(as: Array<A>): Array<Array<Array<A>>> =>
    as.length <= listLength
      ? [[as]]
      : pipe(
          getCombinationsIndices(listLength)(as.length),
          A.flatMap(is =>
            pipe(
              as,
              A.partition((_, i) => is.includes(i)),
              ([bs, as]) =>
                pipe(
                  getAllCombinationsOfSubListsWithFixedLength(listLength)(bs),
                  A.map(A.prepend(as)),
                ),
            ),
          ),
        )

const distributeTeamsUsingCombinations: typeof distributeTeams =
  args => params => players =>
    pipe(
      params.distribution,
      Match.valueTags({
        numOfTeams: ({ numOfTeams }) =>
          getAllCombinationsOfSubListsWithEqualLength(numOfTeams)(players),
        fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
          getAllCombinationsOfSubListsWithFixedLength(fixedNumberOfPlayers)(
            players,
          ),
      }),
      A.match({
        onEmpty: constant([]),
        onNonEmpty: Semigroup.combineAllNonEmpty(
          Semigroup.min(getFitOrdFromCriteria(args)(params)),
        ),
      }),
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
  const paramsArb = fc.record({
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
    params: paramsArb,
    players: fc.array(Arb.make(Player.Schema)(fc)),
  })

  test.skip('should return the optimal solution', () => {
    const playersCounterExample1: Array<Player> = [
      {
        active: false,
        id: Id(''),
        name: '',
        rating: 6.5,
        positionAbbreviation: Abbreviation('m'),
        createdAt: Timestamp.Schema(0),
      },
      {
        active: false,
        id: Id(''),
        name: '',
        rating: 3.5,
        positionAbbreviation: Abbreviation('m'),
        createdAt: Timestamp.Schema(0),
      },
      {
        active: false,
        id: Id(''),
        name: '',
        rating: 2.5,
        positionAbbreviation: Abbreviation('le'),
        createdAt: Timestamp.Schema(0),
      },
      {
        active: false,
        id: Id(''),
        name: '',
        rating: 3,
        positionAbbreviation: Abbreviation('m'),
        createdAt: Timestamp.Schema(0),
      },
      {
        active: false,
        id: Id(''),
        name: '',
        rating: 5,
        positionAbbreviation: Abbreviation('z'),
        createdAt: Timestamp.Schema(0),
      },
    ]
    fc.assert(
      fc.property(
        paramsArb,
        fc.array(Arb.make(Player.Schema)(fc), { minLength: 1, maxLength: 8 }),
        (params, players) =>
          pipe(getFitOrdFromCriteria({ modality })(params), fitOrd =>
            Ord.equals(fitOrd)(distributeTeams({ modality })(params)(players))(
              distributeTeamsUsingCombinations({ modality })(params)(players),
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

  test('should return the same players', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ params, players }) =>
        pipe(
          distributeTeams({ modality })(params)(players),
          A.flatten,
          Eq.equals(A.getUnorderedEquivalence(Eq.strict()))(players),
        ),
      ),
    )
  })

  test('should return the correct number of teams', () => {
    fc.assert(
      fc.property(
        balanceTeamsArb,
        ({ params, players }) =>
          distributeTeams({ modality })(params)(players).length ===
          pipe(
            params.distribution,
            Match.valueTags({
              numOfTeams: ({ numOfTeams }) => numOfTeams,
              fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
                Math.ceil(players.length / fixedNumberOfPlayers),
            }),
          ),
      ),
    )
  })

  test('should return the correct number of players each team', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ params, players }) =>
        distributeTeams({ modality })(params)(players).every(
          (t, i, ts) =>
            t.length ===
            pipe(
              params.distribution,
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

  test('should not have teams with player count difference higher than one in any position', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ params, players }) =>
        pipe(
          distributeTeams({ modality })({ ...params, position: true })(players),
          teams =>
            teams.every(a =>
              teams.every(
                b =>
                  pipe(
                    params.distribution,
                    Match.valueTags({
                      fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
                        a.length !== fixedNumberOfPlayers ||
                        b.length !== fixedNumberOfPlayers,
                      numOfTeams: () => false,
                    }),
                  ) ||
                  pipe(
                    modality.positions,
                    A.every(
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

  test('should return a balanced team', () => {
    expect(
      distributeTeams({ modality })({
        position: true,
        rating: true,
        distribution: { _tag: 'numOfTeams', numOfTeams: 3 },
      })(playersMock),
    ).toMatchSnapshot()
    expect(
      distributeTeams({ modality })({
        position: true,
        rating: true,
        distribution: { _tag: 'fixedNumberOfPlayers', fixedNumberOfPlayers: 7 },
      })(playersMock),
    ).toMatchSnapshot()
  })
})
