import { getDefaultHeaderHeight } from '@react-navigation/elements'
import { Modal, Pressable, View } from 'src/components'
import { AppEvent, appEvents } from 'src/events'
import { Colors } from 'src/services/Theme'
import { named2 } from '../hyperscript'
import { Children } from '../types'

export const HeaderMenu = named2('HeaderMenu')(
  (props: { onClose: AppEvent }) => (children: Children) =>
    Modal({
      transparent: true,
      flex: 1,
      animationType: 'fade',
      onRequestClose: props.onClose,
    })([
      Pressable({
        onPress: props.onClose,
        flex: 1,
        align: 'end',
        rippleColor: Colors.black,
        rippleOpacity: 0,
      })([
        Pressable({
          onPress: appEvents.doNothing(),
          bg: Colors.white,
          m: 8,
          round: 8,
          shadow: 2,
          rippleColor: Colors.black,
          rippleOpacity: 0,
          mt: getDefaultHeaderHeight({ height: 1, width: 0 }, false, 0),
        })([View({ py: 8 })(children)]),
      ]),
    ]),
)
