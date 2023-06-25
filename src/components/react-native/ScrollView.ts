import { $, A, apply } from 'fp'
import React from 'react'
import { ScrollView as RNScrollView_ } from 'react-native'
import {
  Children,
  GapProps,
  JSXElementsChildren,
  PaddingProps,
  UIElement,
} from 'src/components/types'
import { UIEnv } from 'src/services/UI'

export type ScrollViewStyleProps = object

export type ScrollViewContainerStyleProps = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type ScrollViewProps = ScrollViewStyleProps & {
  removeClippedSubviews?: boolean
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
  contentContainerStyle?: ScrollViewContainerStyleProps
}

export type ScrollViewArgs = {
  x: ScrollViewProps
  children?: JSXElementsChildren
  env: UIEnv
}

const getRawProps = ({
  x: props,
  children,
  env: _env,
}: ScrollViewArgs): React.ComponentProps<typeof RNScrollView_> => ({
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

const ScrollView_ = (args: ScrollViewArgs) =>
  React.createElement(RNScrollView_, getRawProps(args))

export const ScrollView =
  (props: ScrollViewProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      ScrollView_,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )
