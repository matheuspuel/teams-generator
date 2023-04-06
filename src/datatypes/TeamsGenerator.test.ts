/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as fc from 'fast-check'
import { $, A, Monoid, Num, Ord, Rec, SG } from 'fp'
import { playersMock } from 'src/mocks/Player'
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
      SG.concatAll({ concat: Ord.min(ord) })([]),
    )

describe('Balance teams', () => {
  it('should return the optimal solution', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        fc.boolean(),
        fc.boolean(),
        fc.array(Arb.to(Player.Schema)(fc), { minLength: 1, maxLength: 4 }),
        (n, position, rating, players) => {
          const result = balanceTeamsByFitOrd(
            getFitOrdFromCriteria({ position, rating }),
          )(n)(players)
          expect(result).toStrictEqual<typeof result>(
            balanceTeamsByFitOrdTestDouble(
              getFitOrdFromCriteria({ position, rating }),
            )(n)(players),
          )
        },
      ),
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
