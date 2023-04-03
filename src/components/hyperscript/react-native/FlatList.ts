import React from 'react'
import { FlatList as FlatList_ } from 'src/components/custom'
import { FlatListProps } from 'src/components/custom/react-native/FlatList'

export const FlatList =
  <R, A>(props: FlatListProps<R, A>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(FlatList_<R, A>, { x: props, env })
