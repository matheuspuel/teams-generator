/* eslint-disable functional/no-expression-statements */
import * as Arb from '@effect/schema/Arbitrary'
import * as Benchmark from 'benchmark'
import * as fc from 'fast-check'
import { $, A, SG, constant, identity } from 'fp'
import { Player } from 'src/datatypes'
import {
  Criteria,
  distributeTeams,
  getFitOrdFromCriteria,
} from 'src/datatypes/TeamsGenerator'
import { getCombinationsIndices } from 'src/utils/Combinations'
import { matchTag } from 'src/utils/Tagged'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sample1 = fc.sample(
  fc.array(Arb.to(Player.Schema)(fc), { minLength: 8, maxLength: 8 }),
  1,
)[0]!

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
      matchTag({
        numOfTeams: ({ numOfTeams }) =>
          getAllCombinationsOfSubListsWithEqualLength(numOfTeams)(players),
        fixedNumberOfPlayers: ({ fixedNumberOfPlayers }) =>
          getAllCombinationsOfSubListsWithFixedLength(fixedNumberOfPlayers)(
            players,
          ),
      }),
      A.match(
        constant([]),
        A.combineMapNonEmpty(SG.min(getFitOrdFromCriteria(params)))(identity),
      ),
    )

const criteria1: Criteria = {
  position: true,
  rating: true,
  distribution: { _tag: 'numOfTeams', numOfTeams: 2 },
}
const criteria2: Criteria = {
  position: true,
  rating: true,
  distribution: { _tag: 'fixedNumberOfPlayers', fixedNumberOfPlayers: 4 },
}

void (async () => {
  await new Promise(resolve => {
    new Benchmark.Suite()
      .add('balanceTeamsBySwappingPlayers1', function (this: unknown) {
        distributeTeams(criteria1)(sample1)
      })
      .add('balanceTeamsUsingCombinations1', function (this: unknown) {
        distributeTeamsUsingCombinations(criteria1)(sample1)
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
        resolve(undefined)
      })
      .run({ async: true })
  })

  await new Promise(resolve => {
    new Benchmark.Suite()
      .add('balanceTeamsBySwappingPlayers2', function (this: unknown) {
        distributeTeams(criteria2)(sample1)
      })
      .add('balanceTeamsUsingCombinations2', function (this: unknown) {
        distributeTeamsUsingCombinations(criteria2)(sample1)
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
        resolve(undefined)
      })
      .run({ async: true })
  })
})()

/**
balanceTeamsBySwappingPlayers1 x 2,231 ops/sec ±3.12% (70 runs sampled)
balanceTeamsUsingCombinations1 x 742 ops/sec ±4.45% (77 runs sampled)
Fastest is balanceTeamsBySwappingPlayers1
balanceTeamsBySwappingPlayers2 x 2,096 ops/sec ±4.04% (81 runs sampled)
balanceTeamsUsingCombinations2 x 689 ops/sec ±3.40% (77 runs sampled)
Fastest is balanceTeamsBySwappingPlayers2
*/