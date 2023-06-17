/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as fc from 'fast-check'
import { $, A, Eq, Match, Ord, Rec, SG, Tup, constant, identity } from 'fp'
import { playersMock } from 'src/mocks/Player'
import { getCombinationsIndices } from 'src/utils/Combinations'
import { Id } from 'src/utils/Entity'
import { Player, Position } from '.'
import { distributeTeams, getFitOrdFromCriteria } from './TeamsGenerator'

const getAllCombinationsOfSubListsWithEqualLength =
  (numOfLists: number) =>
  <A>(as: Array<A>): Array<Array<Array<A>>> =>
    numOfLists <= 1
      ? [[as]]
      : $(
          getCombinationsIndices(Math.floor(as.length / numOfLists))(
            A.length(as),
          ),
          A.map(is =>
            $(
              as,
              A.partition((_, i) => is.includes(i)),
              ([cs, bs]) =>
                $(
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
      : $(
          getCombinationsIndices(listLength)(as.length),
          A.flatMap(is =>
            $(
              as,
              A.partition((_, i) => is.includes(i)),
              ([bs, as]) =>
                $(
                  getAllCombinationsOfSubListsWithFixedLength(listLength)(bs),
                  A.map(A.prepend(as)),
                ),
            ),
          ),
        )

const distributeTeamsUsingCombinations: typeof distributeTeams =
  params => players =>
    $(
      params.distribution,
      Match.valueTags({
        numOfTeams: ({ numOfTeams }) =>
          getAllCombinationsOfSubListsWithEqualLength(numOfTeams)(players),
        fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
          getAllCombinationsOfSubListsWithFixedLength(fixedNumberOfPlayers)(
            players,
          ),
      }),
      A.match(
        constant([]),
        SG.combineAllNonEmpty(SG.min(getFitOrdFromCriteria(params))),
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
    players: fc.array(Arb.to(Player.Schema)(fc)),
  })

  it.skip('should return the optimal solution', () => {
    const playersCounterExample1: Array<Player> = [
      { active: false, id: Id(''), name: '', rating: 6.5, position: 'M' },
      { active: false, id: Id(''), name: '', rating: 3.5, position: 'M' },
      { active: false, id: Id(''), name: '', rating: 2.5, position: 'LE' },
      { active: false, id: Id(''), name: '', rating: 3, position: 'M' },
      { active: false, id: Id(''), name: '', rating: 5, position: 'Z' },
    ]
    fc.assert(
      fc.property(
        paramsArb,
        fc.array(Arb.to(Player.Schema)(fc), { minLength: 1, maxLength: 8 }),
        (params, players) =>
          $(getFitOrdFromCriteria(params), fitOrd =>
            Ord.equals(fitOrd)(distributeTeams(params)(players))(
              distributeTeamsUsingCombinations(params)(players),
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

  it('should return the same players', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ params, players }) =>
        $(
          distributeTeams(params)(players),
          A.flatten,
          Eq.equals(A.getUnorderedEquivalence(Eq.strict()))(players),
        ),
      ),
    )
  })

  it('should return the correct number of teams', () => {
    fc.assert(
      fc.property(
        balanceTeamsArb,
        ({ params, players }) =>
          distributeTeams(params)(players).length ===
          $(
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

  it('should return the correct number of players each team', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ params, players }) =>
        distributeTeams(params)(players).every(
          (t, i, ts) =>
            t.length ===
            $(
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

  it('should not have teams with player count difference higher than one in any position', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ params, players }) =>
        $(distributeTeams({ ...params, position: true })(players), teams =>
          teams.every(a =>
            teams.every(
              b =>
                $(
                  params.distribution,
                  Match.valueTags({
                    fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
                      a.length !== fixedNumberOfPlayers ||
                      b.length !== fixedNumberOfPlayers,
                    numOfTeams: () => false,
                  }),
                ) ||
                $(
                  Position.Dict,
                  Rec.toEntries,
                  A.map(Tup.getFirst),
                  A.every(
                    pos =>
                      Math.abs(
                        a.filter(p => p.position === pos).length -
                          b.filter(p => p.position === pos).length,
                      ) <= 1,
                  ),
                ),
            ),
          ),
        ),
      ),
    )
  })

  it('should return a balanced team', () => {
    expect(
      distributeTeams({
        position: true,
        rating: true,
        distribution: { _tag: 'numOfTeams', numOfTeams: 3 },
      })(playersMock),
    ).toMatchSnapshot()
    expect(
      distributeTeams({
        position: true,
        rating: true,
        distribution: { _tag: 'fixedNumberOfPlayers', fixedNumberOfPlayers: 7 },
      })(playersMock),
    ).toMatchSnapshot()
  })
})
