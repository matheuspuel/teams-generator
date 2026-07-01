import { AppEvent } from 'src/runtime'
import { Pressable } from '../react-native/Pressable'

export const HeaderButton = (props: {
  onPress: AppEvent
  icon: React.ReactNode
}) => (
  <Pressable onPress={props.onPress} p={8} borderless={true} foreground={true}>
    {props.icon}
  </Pressable>
)
