import { $f, A, Ord, Rec, RR } from 'fp'

export const toSortedValues: <B>(
  ord: Ord<B>,
) => <A extends B>(as: Record<string, A>) => Array<A> = ord =>
  $f(
    Rec.toEntries,
    A.map(([_k, i]) => i),
    A.sort(ord),
  )

export const fromEntriesById: <A extends { id: string | number }>(
  as: Array<A>,
) => Record<string, A> = $f(
  A.map(i => [String(i.id), i] as const),
  RR.fromEntries,
)
