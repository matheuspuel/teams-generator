import { flow } from 'fp-ts/lib/function'
import { Ord } from 'fp-ts/lib/Ord'
import { A, Rec, RR } from 'src/utils/fp-ts'

export const toSortedValues: <B>(
  ord: Ord<B>,
) => <A extends B>(as: Record<string, A>) => Array<A> = ord =>
  flow(
    Rec.toEntries,
    A.map(([_k, i]) => i),
    A.sort(ord),
  )

export const fromEntriesById: <A extends { id: string | number }>(
  as: Array<A>,
) => Record<string, A> = flow(
  A.map(i => [String(i.id), i] as const),
  RR.fromEntries,
)
