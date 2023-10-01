import { Effect } from 'effect/Effect'
import { F } from 'fp'
import * as React from 'react'

export const useState = <A>(initialStateLazy: () => A) => {
  const [value, updater] = React.useState(initialStateLazy)
  const update = React.useMemo(
    () =>
      (f: (a: A) => A): Effect<never, never, void> =>
        F.sync(() => updater(f)),
    [updater],
  )
  const set = React.useMemo(() => (a: A) => update(() => a), [update])
  return { value, update, set }
}
