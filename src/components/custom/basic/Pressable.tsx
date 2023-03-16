import { IO, Rec } from 'fp'
import { Pressable as Pressable_ } from 'react-native'
import { PressableStateCallbackType } from 'react-native/types'
import { Elements, getViewStyleProp, ViewProps, ViewStyleProps } from './View'

const merge = Rec.getUnionSemigroup({
  concat: (a, b) => (b === undefined ? a : b),
}).concat

export const Pressable = ({
  x: { pressed: pressedProps, ...props },
  children,
}: {
  x: ViewProps & {
    onPress: IO<void>
    pressed?: ViewStyleProps
    isEnabled?: boolean
  }
  children: Elements | ((state: PressableStateCallbackType) => Elements)
}) => (
  <Pressable_
    {...{
      style: pressedProps
        ? ({ pressed }) =>
            getViewStyleProp(pressed ? merge(props, pressedProps) : props)
        : getViewStyleProp(props),
      onPress: props.onPress,
      onLayout: props.onLayout,
      children: children,
      disabled: props.isEnabled === false,
    }}
  />
)
