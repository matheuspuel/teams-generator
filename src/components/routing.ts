import { A } from 'fp'
import { Fragment } from 'src/components'
import { UIElement } from 'src/components/types'

export const screen =
  <A>(f: (args: A) => UIElement) =>
  (args: A) => ({ _tag: 'Screen' as const, screen: f(args) })

export const modal =
  <A>(f: (args: A) => UIElement) =>
  (args: A) => ({ _tag: 'Modal' as const, modal: f(args) })

export const mergeModalsToScreens = A.reduce(
  [],
  (
    acc: Array<UIElement>,
    v:
      | { _tag: 'Screen'; screen: UIElement }
      | { _tag: 'Modal'; modal: UIElement },
  ) =>
    v._tag === 'Screen'
      ? [...acc, v.screen]
      : A.matchRight(acc, {
          onEmpty: () => [v.modal],
          onNonEmpty: (init, last) => [...init, Fragment([last, v.modal])],
        }),
)
