import { Array, pipe } from 'effect'
import { constUndefined } from 'effect/Function'
import * as React from 'react'
import { FlatList as RNFlatList_ } from 'react-native'
import { GapProps, PaddingProps } from 'src/components/types'

export type FlatListStyleProps = object

export type FlatListContainerStyleProps = PaddingProps &
  GapProps & { flex?: number; flexGrow?: number }

export type FlatListProps<A> = FlatListStyleProps & {
  data: ReadonlyArray<A>
  renderItem: (item: A, index: number) => React.ReactElement
  ListEmptyComponent: React.ReactElement
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

export const FlatList = <A,>(props: FlatListProps<A>) => {
  return (
    <RNFlatList_<A>
      data={props.data}
      renderItem={({ item, index }) => props.renderItem(item, index)}
      ListEmptyComponent={pipe(
        props.data,
        Array.match({
          onEmpty: () => props.ListEmptyComponent,
          onNonEmpty: constUndefined,
        }),
      )}
      keyExtractor={props.keyExtractor}
      getItemLayout={pipe(props.getItemLayout, f =>
        f
          ? (data: ArrayLike<A> | null | undefined, index: number) =>
              f(data ? globalThis.Array.from(data) : [], index)
          : undefined,
      )}
      removeClippedSubviews={props.removeClippedSubviews}
      initialNumToRender={props.initialNumToRender}
      maxToRenderPerBatch={props.maxToRenderPerBatch}
      updateCellsBatchingPeriod={props.updateCellsBatchingPeriod}
      windowSize={props.windowSize}
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
    />
  )
}
