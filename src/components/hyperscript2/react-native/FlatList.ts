import React from 'react'
import { FlatList as FlatList_ } from 'src/components/custom2'
import { FlatListProps } from 'src/components/custom2/react-native/FlatList'

export const FlatList =
  <R, A>(props: FlatListProps<R, A>) =>
  (env: R) =>
    React.createElement(FlatList_<R, A>, { x: props, env })
