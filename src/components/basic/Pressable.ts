import { ReaderIO } from 'fp'
import { PressableStateCallbackType } from 'react-native/types'
import { Pressable as Pressable_ } from '../hyperscript/reactNative'

type PressableStyle = {
  flex?: number
  justifyContent?: 'center'
  margin?: number
  elevation?: number
  marginRight?: number
  padding?: number
  paddingHorizontal?: number
  borderRadius?: number
  backgroundColor?: string
  height?: number
  marginTop?: number
  alignItems?: 'center'
}

export const Pressable =
  <R1>(props: {
    key?: string
    style?: PressableStyle | ((state: { pressed: boolean }) => PressableStyle)
    onPress: ReaderIO<R1, void>
  }) =>
  <R2>(
    children:
      | ReadonlyArray<(env: R2) => React.ReactElement>
      | ((
          state: PressableStateCallbackType,
        ) => ReadonlyArray<(env: R2) => React.ReactElement>),
  ) =>
  (env: R1 & R2) =>
    Pressable_({ ...props, onPress: props.onPress(env) })(children)(env)
