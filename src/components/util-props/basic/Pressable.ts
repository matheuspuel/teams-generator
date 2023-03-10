import { PressableStateCallbackType } from 'react-native/types'
import { Pressable as Pressable_ } from 'src/components/safe/basic/Pressable'
import { Reader, ReaderIO } from 'src/utils/fp'
import { getViewStyleProp, ViewProps, ViewStyleProps } from './View'

export const Pressable =
  <R1>(
    props: ViewProps<R1> & {
      onPress: ReaderIO<R1, void>
      pressed?: ViewStyleProps
    },
  ) =>
  <R2>(
    children:
      | ReadonlyArray<Reader<R2, React.ReactElement>>
      | ((
          state: PressableStateCallbackType,
        ) => ReadonlyArray<Reader<R2, React.ReactElement>>),
  ) =>
  (env: R1 & R2) =>
    Pressable_({
      key: props.key,
      style: props.pressed
        ? ({ pressed }) =>
            pressed ? getViewStyleProp(props.pressed) : getViewStyleProp(props)
        : getViewStyleProp(props),
      onPress: props.onPress,
      onLayout: props.onLayout,
    })(children)(env)
