import React from 'react'
import { PressableStateCallbackType } from 'react-native/types'
import { Pressable as Pressable_ } from 'src/components/custom/basic/Pressable'
import { Fragment } from 'src/components/hyperscript/react'
import { $, apply, RA, Reader, ReaderIO } from 'src/utils/fp'

export type PressableProps<R> = Omit<
  React.ComponentProps<typeof Pressable_>,
  'children' | 'onPress' | 'onLayout'
> & {
  key?: string
  onPress: ReaderIO<R, void>
  onLayout?: ReaderIO<R, void>
}

export const Pressable =
  <R1>(props: PressableProps<R1>) =>
  <R2>(
    children:
      | ReadonlyArray<Reader<R2, React.ReactElement>>
      | ((
          state: PressableStateCallbackType,
        ) => ReadonlyArray<Reader<R2, React.ReactElement>>),
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & R2) =>
    React.createElement(
      Pressable_,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      {
        ...props,
        onPress: props.onPress(env),
        onLayout: props.onLayout?.(env),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      ...(typeof children === 'function'
        ? [
            ((state: PressableStateCallbackType) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Fragment(children(state))(env)) as any,
          ]
        : $(children, RA.map(apply(env)))),
    )
