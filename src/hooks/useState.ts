import { Effect } from 'effect'
import * as React from 'react'

export const useState = <A>(initialStateLazy: () => A) => {
  const [value, updater] = React.useState(initialStateLazy)
  const update = React.useMemo(
    () =>
      (f: (a: A) => A): Effect.Effect<void> =>
        Effect.sync(() => updater(f)),
    [updater],
  )
  const set = React.useMemo(() => (a: A) => update(() => a), [update])
  return { value, update, set }
}
