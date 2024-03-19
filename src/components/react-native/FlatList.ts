import { ReadonlyArray, pipe } from 'effect'
import { constUndefined } from 'effect/Function'
import React from 'react'
import { FlatList as RNFlatList_ } from 'react-native'
import { GapProps, PaddingProps, UIElement } from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { named } from '../hyperscript'

export type FlatListStyleProps = object

export type FlatListContainerStyleProps = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type FlatListProps<A> = FlatListStyleProps & {
  data: ReadonlyArray<A>
  renderItem: (item: A, index: number) => UIElement
  ListEmptyComponent: UIElement
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
  contentContainerStyle?: FlatListContainerStyleProps
}

export type FlatListArgs<A> = {
  x: FlatListProps<A>
  runtime: AppRuntime
}

const getRawProps = <A>({
  x: props,
  runtime: _runtime,
}: FlatListArgs<A>): React.ComponentProps<typeof RNFlatList_<A>> => ({
  data: props.data,
  renderItem: ({ item, index }) => props.renderItem(item, index),
  ListEmptyComponent: pipe(
    props.data,
    ReadonlyArray.match({
      onEmpty: () => props.ListEmptyComponent,
      onNonEmpty: constUndefined,
    }),
  ),
  keyExtractor: props.keyExtractor,
  getItemLayout: pipe(props.getItemLayout, f =>
    f ? (data, index) => f(data ? (data as Array<A>) : [], index) : undefined,
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

const FlatList_ = <A>(args: FlatListArgs<A>) =>
  React.createElement(RNFlatList_<A>, getRawProps(args))

export const FlatList = named('FlatList')(<A>(
  props: FlatListProps<A>,
): UIElement => {
  const runtime = useRuntime()
  return React.createElement(FlatList_<A>, { x: props, runtime })
})
