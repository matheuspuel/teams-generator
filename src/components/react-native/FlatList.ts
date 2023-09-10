import { A, constUndefined, pipe } from 'fp'
import React from 'react'
import { FlatList as RNFlatList_ } from 'react-native'
import { GapProps, PaddingProps, UIElement } from 'src/components/types'
import { UIEnv } from 'src/services/UI'

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
  env: UIEnv
}

const getRawProps = <A>({
  x: props,
  env,
}: FlatListArgs<A>): React.ComponentProps<typeof RNFlatList_<A>> => ({
  data: props.data,
  renderItem: ({ item, index }) => props.renderItem(item, index)(env),
  ListEmptyComponent: pipe(
    props.data,
    A.match({
      onEmpty: () => props.ListEmptyComponent(env),
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

export const FlatList =
  <A>(props: FlatListProps<A>): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(FlatList_<A>, { x: props, env })
