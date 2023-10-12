import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { named } from '../hyperscript'
import { Pressable } from '../react-native/Pressable'
import { UIElement } from '../types'

export const HeaderButton = named('HeaderButton')(
  (props: { onPress: AppEvent; icon: UIElement }): UIElement =>
    Pressable({
      onPress: props.onPress,
      p: 8,
      borderless: true,
      foreground: true,
    })([TextStyleContextProvider({ color: Colors.text.light })([props.icon])]),
)
