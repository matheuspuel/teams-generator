import { $, apply, RA, Reader, ReaderIO } from 'fp'
import React from 'react'
import { View as View_ } from 'src/components/custom/basic/View'

export type ViewProps<R> = Omit<
  React.ComponentProps<typeof View_>['x'],
  'children' | 'onLayout'
> & {
  key?: string
  onLayout?: ReaderIO<R, void>
}

export const View =
  <R1>(props?: ViewProps<R1> & { key?: string }) =>
  <R2>(children: ReadonlyArray<Reader<R2, React.ReactElement>>) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & R2) =>
    React.createElement(
      View_,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      { x: { ...props, onLayout: props?.onLayout?.(env) } } as any,
      ...$(children, RA.map(apply(env))),
    )
