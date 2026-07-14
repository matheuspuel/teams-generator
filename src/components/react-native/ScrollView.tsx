import * as React from 'react'
import { ScrollView as RNScrollView_ } from 'react-native'
import type { GapProps, PaddingProps } from 'src/components/types'

export type ScrollViewStyleProps = object

export type ScrollViewContainerStyleProps = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type ScrollViewProps = ScrollViewStyleProps & {
  removeClippedSubviews?: boolean
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
  contentContainerStyle?: ScrollViewContainerStyleProps
  children: React.ReactNode
}

export const ScrollView = (props: ScrollViewProps) => {
  return (
    <RNScrollView_
      removeClippedSubviews={props.removeClippedSubviews}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
      contentContainerStyle={{
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
      }}
    >
      {props.children}
    </RNScrollView_>
  )
}
