import { Pressable, Txt } from 'src/components'
import { TextStyleContext } from 'src/contexts/TextStyle'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'

export const HeaderMenuButton = (props: {
  onPress: AppEvent
  label: string
  icon: React.ReactNode
}) => (
  <Pressable
    onPress={props.onPress}
    direction="row"
    align="center"
    p={12}
    gap={8}
  >
    <TextStyleContext.Provider value={{ color: Colors.primary }}>
      {props.icon}
    </TextStyleContext.Provider>
    <Txt>{props.label}</Txt>
  </Pressable>
)
