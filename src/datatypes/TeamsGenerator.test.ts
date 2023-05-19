/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as fc from 'fast-check'
import { $, A, Eq, Ord, Rec, SG, Tup, constant } from 'fp'
import { playersMock } from 'src/mocks/Player'
import { getCombinationsIndices } from 'src/utils/Combinations'
import { Id } from 'src/utils/Entity'
import { Player, Position } from '.'
import {
  balanceTeamsByCriteria,
  balanceTeamsByFitOrd,
  getFitOrdFromCriteria,
} from './TeamsGenerator'

const getAllTeamCombinations =
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Array<Player>>> =>
    numOfTeams <= 1
      ? [[players]]
      : $(
          getCombinationsIndices(Math.floor(players.length / numOfTeams))(
            A.length(players),
          ),
          A.map(is =>
            $(
              players,
              A.partition((_, i) => is.includes(i)),
              ([bs, as]) =>
                $(
                  getAllTeamCombinations(numOfTeams - 1)(bs),
                  A.map(A.prepend(as)),
                ),
            ),
          ),
          A.flatten,
        )

const balanceTeamsByFitOrdUsingCombinations: typeof balanceTeamsByFitOrd =
  ord => numOfTeams => players =>
    $(
      getAllTeamCombinations(numOfTeams)(players),
      A.match(constant([]), SG.combineAllNonEmpty(SG.min(ord))),
    )

describe('Balance teams', () => {
  const balanceTeamsArb = fc.record({
    n: fc.integer({ min: 2, max: 9 }),
    params: fc.record({
      position: fc.boolean(),
      rating: fc.boolean(),
    }),
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
        fc.integer({ min: 2, max: 4 }),
        fc.record({ position: fc.boolean(), rating: fc.boolean() }),
        fc.array(Arb.to(Player.Schema)(fc), { minLength: 1, maxLength: 8 }),
        (n, params, players) =>
          $(getFitOrdFromCriteria(params), fitOrd =>
            Ord.equals(fitOrd)(balanceTeamsByFitOrd(fitOrd)(n)(players))(
              balanceTeamsByFitOrdUsingCombinations(fitOrd)(n)(players),
            ),
          ),
      ),
      {
        examples: [
          [2, { position: true, rating: true }, playersCounterExample1],
        ],
      },
    )
  })

  it('should return the same players', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ n, params, players }) =>
        $(
          balanceTeamsByCriteria(params)(n)(players),
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
        ({ n, params, players }) =>
          balanceTeamsByCriteria(params)(n)(players).length === n,
      ),
    )
  })

  it('should not have teams with player count difference higher than one', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ n, params, players }) =>
        $(balanceTeamsByCriteria(params)(n)(players), teams =>
          teams.every(a =>
            teams.every(b => Math.abs(a.length - b.length) <= 1),
          ),
        ),
      ),
    )
  })

  it('should not have teams with player count difference higher than one in any position', () => {
    fc.assert(
      fc.property(balanceTeamsArb, ({ n, params, players }) =>
        $(
          balanceTeamsByCriteria({ ...params, position: true })(n)(players),
          teams =>
            teams.every(a =>
              teams.every(b =>
                $(
                  Position.Dict,
                  Rec.toEntries,
                  A.map(Tup.fst),
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
    const result = balanceTeamsByCriteria({ position: true, rating: true })(3)(
      playersMock,
    )
    expect(result).toMatchSnapshot()
  })
})
