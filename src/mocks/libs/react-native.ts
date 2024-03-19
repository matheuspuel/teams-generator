import { unstable_batchedUpdates as unstable_batchedUpdates_ } from 'react-native'

export const unstable_batchedUpdates: typeof unstable_batchedUpdates_ = <R>(
  f: (_: void) => R,
): R => f()
