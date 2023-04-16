import { $, RA, Reader, constUndefined } from 'fp'
import React from 'react'
import { FlatList as FlatList_ } from 'react-native'
import { Element, GapProps, PaddingProps } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type FlatListStyleProps<R> = object

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type FlatListContainerStyleProps<R> = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type FlatListProps<R, A> = FlatListStyleProps<R> & {
  data: ReadonlyArray<A>
  renderItem: (item: A, index: number) => Reader<R, Element>
  ListEmptyComponent: Reader<R, Element>
  keyExtractor?: (item: A, index: number) => string
  getItemLayout?: (
    data: Array<A>,
    index: number,
  ) => {
    length: number
    offset: number
    index: number
  }
  removeClippedSubviews?: boolean
  initialNumToRender?: number
  maxToRenderPerBatch?: number
  updateCellsBatchingPeriod?: number
  windowSize?: number
  contentContainerStyle?: FlatListContainerStyleProps<R>
}

export type FlatListArgs<R, A> = {
  x: FlatListProps<R, A>
  env: R
}

const getRawProps = <R, A>({
  x: props,
  env,
}: FlatListArgs<R, A>): React.ComponentProps<typeof FlatList_<A>> => ({
  data: props.data,
  renderItem: ({ item, index }) => props.renderItem(item, index)(env),
  ListEmptyComponent: $(
    props.data,
    RA.matchW(() => props.ListEmptyComponent(env), constUndefined),
  ),
  keyExtractor: props.keyExtractor,
  getItemLayout: $(props.getItemLayout, f =>
    f ? (data, index) => f(data ?? [], index) : undefined,
  ),
  removeClippedSubviews: props.removeClippedSubviews,
  initialNumToRender: props.initialNumToRender,
  maxToRenderPerBatch: props.maxToRenderPerBatch,
  updateCellsBatchingPeriod: props.updateCellsBatchingPeriod,
  windowSize: props.windowSize,
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
