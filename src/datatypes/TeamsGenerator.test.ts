/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as fc from 'fast-check'
import { $, A, Monoid, NEA, Num, O, Rec, SG, constant } from 'fp'
import { playersMock } from 'src/mocks/Player'
import { Id } from 'src/utils/Entity'
import { Player, Position } from '.'
import {
  balanceTeamsByCriteria,
  balanceTeamsByFitOrd,
  divideTeams,
  getFitOrdFromCriteria,
} from './TeamsGenerator'

const getAllPermutations = <A>(inputArr: Array<A>): Array<Array<A>> => {
  const result: Array<Array<A>> = []
  const permute = (arr: Array<A>, m: Array<A> = []) => {
    // eslint-disable-next-line functional/no-conditional-statements
    if (arr.length === 0) {
      // eslint-disable-next-line functional/immutable-data
      result.push(m)
      // eslint-disable-next-line functional/no-conditional-statements
    } else {
      // eslint-disable-next-line functional/no-loop-statements
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice()
        // eslint-disable-next-line functional/immutable-data
        const next = curr.splice(i, 1)
        permute(curr.slice(), m.concat(next))
      }
    }
  }
  permute(inputArr)
  return result
}

const balanceTeamsByFitOrdTestDouble: typeof balanceTeamsByFitOrd =
  ord => numOfTeams => players =>
    $(
      getAllPermutations(players),
      A.map(divideTeams(numOfTeams)),
      NEA.fromArray,
      O.map(NEA.concatAll(SG.min(ord))),
      O.getOrElseW(constant([])),
    )

const playersCounterExample1: Array<Player> = [
  { active: false, id: Id(''), name: '', rating: 6.5, position: 'M' },
  { active: false, id: Id(''), name: '', rating: 3.5, position: 'M' },
  { active: false, id: Id(''), name: '', rating: 2.5, position: 'LE' },
  { active: false, id: Id(''), name: '', rating: 3, position: 'M' },
  { active: false, id: Id(''), name: '', rating: 5, position: 'Z' },
]

describe('Balance teams', () => {
  it('should return the optimal solution', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        fc.boolean(),
        fc.boolean(),
        fc.array(Arb.to(Player.Schema)(fc), { minLength: 1, maxLength: 6 }),
        (n, position, rating, players) =>
          $(getFitOrdFromCriteria({ position, rating }), fitOrd =>
            fitOrd.equals(
              balanceTeamsByFitOrd(fitOrd)(n)(players),
              balanceTeamsByFitOrdTestDouble(fitOrd)(n)(players),
            ),
          ),
      ),
      { examples: [[2, true, true, playersCounterExample1]] },
    )
  })

  it('should return the same number of players', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.boolean(),
        fc.boolean(),
        fc.array(Arb.to(Player.Schema)(fc)),
        (n, position, rating, players) =>
          Monoid.concatAll(Num.MonoidSum)(
            balanceTeamsByCriteria({ position, rating })(n)(players).map(
              A.size,
            ),
          ) === players.length,
      ),
    )
  })

  it('should return the correct number of teams', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.boolean(),
        fc.boolean(),
        fc.array(Arb.to(Player.Schema)(fc)),
        (n, position, rating, players) =>
          balanceTeamsByCriteria({ position, rating })(n)(players).length === n,
      ),
    )
  })

  it('should not have teams with player count difference higher than one', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.boolean(),
        fc.boolean(),
        fc.array(Arb.to(Player.Schema)(fc)),
        (n, position, rating, players) =>
          $(balanceTeamsByCriteria({ position, rating })(n)(players), teams =>
            teams.every(a =>
              teams.every(b => Math.abs(a.length - b.length) <= 1),
            ),
          ),
      ),
    )
  })

  it('should not have teams with player count difference higher than one in any position', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.boolean(),
        fc.array(Arb.to(Player.Schema)(fc)),
        (n, rating, players) =>
          $(
            balanceTeamsByCriteria({ position: true, rating })(n)(players),
            teams =>
              teams.every(a =>
                teams.every(b =>
                  Rec.keys(Position.Dict).every(
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
    )
  })

  it('should return a balanced team', () => {
    const result = balanceTeamsByCriteria({ position: true, rating: true })(3)(
      playersMock,
    )
    expect(result).toMatchSnapshot()
  })
})
