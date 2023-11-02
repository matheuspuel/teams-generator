import { Pressable, Txt } from 'src/components'
import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { named } from '../hyperscript'
import { UIElement } from '../types'

export const HeaderMenuButton = named('HeaderMenuButton')(
  (props: { onPress: AppEvent; label: string; icon: UIElement }): UIElement =>
    Pressable({
      onPress: props.onPress,
      direction: 'row',
      align: 'center',
      p: 12,
      gap: 8,
    })([
      TextStyleContextProvider({ color: Colors.primary })([props.icon]),
      Txt()(props.label),
    ]),
)
