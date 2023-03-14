import { Pressable as Pressable_ } from 'react-native'
import { PressableStateCallbackType } from 'react-native/types'
import { IO, Rec } from 'src/utils/fp'
import { getViewStyleProp, ViewProps, ViewStyleProps } from './View'

const merge = Rec.getUnionSemigroup({
  concat: (a, b) => (b === undefined ? a : b),
}).concat

export const Pressable = ({
  pressed: pressedProps,
  ...props
}: ViewProps & {
  onPress: IO<void>
  pressed?: ViewStyleProps
  children:
    | ReadonlyArray<React.ReactElement>
    | ((state: PressableStateCallbackType) => ReadonlyArray<React.ReactElement>)
}) => (
  <Pressable_
    {...{
      style: pressedProps
        ? ({ pressed }) =>
            getViewStyleProp(pressed ? merge(props, pressedProps) : props)
        : getViewStyleProp(props),
      onPress: props.onPress,
      onLayout: props.onLayout,
      children: props.children,
    }}
  />
)
