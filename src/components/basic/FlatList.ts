import React from 'react'
import { FlatList as FlatList_ } from 'src/components/hyperscript/reactNative'

export const FlatList =
  <R, A>(props: {
    data: ReadonlyArray<A>
    renderItem: (item: A, index: number) => (env: R) => React.ReactElement
    keyExtractor?: (item: A, index: number) => string
    initialNumToRender?: number
  }) =>
  (env: R) =>
    FlatList_<A>({
      ...props,
      renderItem: ({ item, index }) => props.renderItem(item, index)(env),
    })(env)
