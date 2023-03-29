import React from 'react'
import { FlatList as FlatList_ } from 'react-native'
import { GapProps, PaddingProps } from '../types'

export type FlatListStyleProps<R> = {}

export type FlatListContainerStyleProps<R> = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type FlatListProps<R, A> = FlatListStyleProps<R> & {
  data: ReadonlyArray<A>
  renderItem: (item: A, index: number) => (env: R) => React.ReactElement
  keyExtractor?: (item: A, index: number) => string
  initialNumToRender?: number
  contentContainerStyle?: FlatListContainerStyleProps<R>
}

export type FlatListArgs<R, A> = {
  x: FlatListProps<R, A>
  env: R
}

const getRawProps = <R extends unknown, A>({
  x: props,
  env,
}: FlatListArgs<R, A>): React.ComponentProps<typeof FlatList_<A>> => ({
  data: props.data,
  renderItem: ({ item, index }) => props.renderItem(item, index)(env),
  keyExtractor: props.keyExtractor,
  initialNumToRender: props.initialNumToRender,
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

export const FlatList = <R, A>(args: FlatListArgs<R, A>) => (
  <FlatList_ {...getRawProps(args)} />
)
