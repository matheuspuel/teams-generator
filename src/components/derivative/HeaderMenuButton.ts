import { Pressable, Txt } from 'src/components'
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { named2 } from '../helpers'
import { UIElement } from '../types'

export const HeaderMenuButton = named2('HeaderMenuButton')(
  (props: { onPress: AppEvent; label: string; icon: UIElement }): UIElement =>
    Pressable({
      onPress: props.onPress,
      direction: 'row',
      align: 'center',
      p: 12,
      gap: 8,
    })([
      env =>
        props.icon({
          ...env,
          context: { ...env.context, textColor: Colors.primary.$5 },
        }),
      env =>
        Txt()(props.label)({
          ...env,
          context: { ...env.context, textColor: Colors.text.dark },
        }),
    ]),
)
