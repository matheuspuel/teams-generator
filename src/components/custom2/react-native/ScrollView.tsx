import React from 'react'
import { ScrollView as ScrollView_ } from 'react-native'
import { GapProps, JSXElementsChildren, PaddingProps } from '../types'

export type ScrollViewStyleProps<R> = {}

export type ScrollViewContainerStyleProps<R> = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type ScrollViewProps<R> = ScrollViewStyleProps<R> & {
  removeClippedSubviews?: boolean
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
  contentContainerStyle?: ScrollViewContainerStyleProps<R>
}

export type ScrollViewArgs<R> = {
  x: ScrollViewProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: ScrollViewArgs<R>): React.ComponentProps<typeof ScrollView_> => ({
  children: children,
  removeClippedSubviews: props.removeClippedSubviews,
  keyboardShouldPersistTaps: props.keyboardShouldPersistTaps,
  contentContainerStyle: {
    padding: props.contentContainerStyle?.p,
    paddingHorizontal: props.contentContainerStyle?.px,
    paddingVertical: props.contentContainerStyle?.py,
    paddingLeft: props.contentContainerStyle?.pl,
    paddingRight: props.contentContainerStyle?.pr,
    paddingTop: props.contentContainerStyle?.pt,
    paddingBottom: props.contentContainerStyle?.pb,
    gap: props.contentContainerStyle?.gap,
    rowGap: props.contentContainerStyle?.gapX,
    columnGap: props.contentContainerStyle?.gapY,
    flex: props.contentContainerStyle?.flex,
    flexGrow: props.contentContainerStyle?.flexGrow,
  },
})

export const ScrollView = <R extends unknown>(args: ScrollViewArgs<R>) => (
  <ScrollView_ {...getRawProps(args)} />
)
