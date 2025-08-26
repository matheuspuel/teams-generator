/* eslint-disable functional/no-expression-statements */
import { Semigroup } from '@effect/typeclass'
import * as Benchmark from 'benchmark'
import { Arbitrary, Array, Effect, Match, pipe } from 'effect'
import { constant } from 'effect/Function'
import * as fc from 'fast-check'
import { Player } from 'src/datatypes'
import { soccer } from 'src/datatypes/Modality'
import {
  Criteria,
  distributeTeams,
  getFitOrdFromCriteria,
} from 'src/datatypes/TeamsGenerator'
import { getCombinationsIndices } from 'src/utils/Combinations'
import { combineAllNonEmpty } from 'src/utils/fp/Semigroup'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const sample1 = fc.sample(
  fc.array(Arbitrary.make(Player.Player), { minLength: 8, maxLength: 8 }),
  1,
)[0]!

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

const modality = soccer

void (async () => {
  await new Promise(resolve => {
    new Benchmark.Suite()
      .add('balanceTeamsBySwappingPlayers1', function (this: unknown) {
        distributeTeams({
          players: sample1,
          modality,
          criteria: criteria1,
        }).pipe(Effect.runSync)
      })
      .add('balanceTeamsUsingCombinations1', function (this: unknown) {
        distributeTeamsUsingCombinations({
          players: sample1,
          modality,
          criteria: criteria1,
        }).pipe(Effect.runSync)
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
        distributeTeams({
          players: sample1,
          modality,
          criteria: criteria2,
        }).pipe(Effect.runSync)
      })
      .add('balanceTeamsUsingCombinations2', function (this: unknown) {
        distributeTeamsUsingCombinations({
          players: sample1,
          modality,
          criteria: criteria2,
        }).pipe(Effect.runSync)
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
