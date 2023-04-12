/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as Benchmark from 'benchmark'
import * as fc from 'fast-check'
import { $, A, NEA, O, SG, constant } from 'fp'
import { Player } from 'src/datatypes'
import {
  balanceTeamsByFitOrd,
  getFitOrdFromCriteria,
} from 'src/datatypes/TeamsGenerator'
import { getCombinationsIndices } from 'src/utils/Combinations'

const suite = new Benchmark.Suite()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sample1 = fc.sample(
  fc.array(Arb.to(Player.Schema)(fc), { minLength: 8, maxLength: 8 }),
  1,
)[0]!

const getAllTeamCombinations =
  (numOfTeams: number) =>
  (players: Array<Player>): Array<Array<Array<Player>>> =>
    numOfTeams <= 1
      ? [[players]]
      : $(
          getCombinationsIndices(Math.floor(players.length / numOfTeams))(
            A.size(players),
          ),
          A.map(is =>
            $(
              players,
              A.partitionWithIndex(i => is.includes(i)),
              ({ right: as, left: bs }) =>
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
      NEA.fromArray,
      O.map(NEA.concatAll(SG.min(ord))),
      O.getOrElseW(constant([])),
    )

const fitOrd = getFitOrdFromCriteria({ position: true, rating: true })

suite
  .add('balanceTeamsByFitOrdBySwappingPlayers', function (this: unknown) {
    balanceTeamsByFitOrd(fitOrd)(3)(sample1)
  })
  .add('balanceTeamsByFitOrdUsingCombinations', function (this: unknown) {
    balanceTeamsByFitOrdUsingCombinations(fitOrd)(3)(sample1)
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .on('cycle', function (event: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(String(event.target))
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .on('complete', function (this: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
