import { Array } from 'effect'

export const screen = (f: () => React.ReactNode) => () => ({
  _tag: 'Screen' as const,
  screen: f(),
})

export const modal = (f: () => React.ReactNode) => () => ({
  _tag: 'Modal' as const,
  modal: f(),
})

export const mergeModalsToScreens = Array.reduce(
  [],
  (
    acc: Array<React.ReactNode>,
    v:
      | { _tag: 'Screen'; screen: React.ReactNode }
      | { _tag: 'Modal'; modal: React.ReactNode },
  ) =>
    v._tag === 'Screen'
      ? [...acc, v.screen]
      : Array.matchRight(acc, {
          onEmpty: () => [v.modal],
          onNonEmpty: (init, last) => [
            ...init,
            <>
              {last}
              {v.modal}
            </>,
          ],
        }),
)
