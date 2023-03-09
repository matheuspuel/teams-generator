import * as React from 'react'
import {
  ActivityIndicator as ActivityIndicator_,
  Button as Button_,
  FlatList as FlatList_,
  FlatListProps,
  Modal as Modal_,
  Pressable as Pressable_,
  PressableStateCallbackType,
  ScrollView as ScrollView_,
  Text as Text_,
  TextInput as TextInput_,
  View as View_,
} from 'react-native'
import {
  makeComponentFromClass,
  makeComponentFromClassWithoutChildren,
} from './helpers'
import { Fragment } from './react'

export const View = makeComponentFromClass(View_)

export const ScrollView = makeComponentFromClass(ScrollView_)

export const FlatList = <A>(
  props: React.ClassAttributes<FlatList_<A>> & FlatListProps<A>,
) => makeComponentFromClassWithoutChildren(FlatList_<A>)(props)

export const Text = makeComponentFromClass(Text_)

export const TextInput = makeComponentFromClassWithoutChildren(TextInput_)

export const Pressable =
  (props?: React.ComponentProps<typeof Pressable_>) =>
  // eslint-disable-next-line react/display-name
  (
    children:
      | ReadonlyArray<React.ReactElement>
      | ((
          state: PressableStateCallbackType,
        ) => ReadonlyArray<React.ReactElement>),
  ) =>
    React.createElement(
      Pressable_,
      props,
      ...(typeof children === 'function'
        ? [
            ((state: PressableStateCallbackType) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Fragment(children(state))) as any,
          ]
        : children),
    )

export const Button = makeComponentFromClassWithoutChildren(Button_)

export const Modal = makeComponentFromClass(Modal_)

export const ActivityIndicator =
  makeComponentFromClassWithoutChildren(ActivityIndicator_)
