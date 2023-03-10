import { ReaderIO } from 'fp'
import { PressableStateCallbackType } from 'react-native/types'
import { ViewDescriptiveStyleProp } from 'src/components/util-props/basic/View'
import { Pressable as Pressable_ } from '../../hyperscript/reactNative'

export const Pressable =
  <R1>(props: {
    key?: string
    style?:
      | ViewDescriptiveStyleProp
      | ((state: { pressed: boolean }) => ViewDescriptiveStyleProp)
    onPress: ReaderIO<R1, void>
    onLayout?: ReaderIO<R1, void>
  }) =>
  <R2>(
    children:
      | ReadonlyArray<(env: R2) => React.ReactElement>
      | ((
          state: PressableStateCallbackType,
        ) => ReadonlyArray<(env: R2) => React.ReactElement>),
  ) =>
  (env: R1 & R2) =>
    Pressable_({
      ...props,
      onPress: props.onPress(env),
      onLayout: props.onLayout?.(env),
    })(children)(env)
