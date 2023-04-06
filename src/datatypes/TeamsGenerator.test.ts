/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as fc from 'fast-check'
import { $, A, Monoid, Num } from 'fp'
import { playersMock } from 'src/mocks/Player'
import { Player } from '.'
import { balanceTeamsByCriteria } from './TeamsGenerator'

describe('Balance teams', () => {
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

  it('should return a balanced team', () => {
    const result = balanceTeamsByCriteria({ position: true, rating: true })(3)(
      playersMock,
    )
    expect(result).toMatchSnapshot()
  })
})
