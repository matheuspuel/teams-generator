import * as React from 'react'
import { ScrollView as RNScrollView_ } from 'react-native'
import {
  Children,
  GapProps,
  JSXElementsChildren,
  PaddingProps,
  UIElement,
} from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { named2 } from '../hyperscript'

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
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  children,
  runtime: _runtime,
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

export const ScrollView = named2('ScrollView')((props: ScrollViewProps = {}) =>
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement => {
    const runtime = useRuntime()
    return React.createElement(ScrollView_, { x: props, runtime }, ...children)
  },
)
