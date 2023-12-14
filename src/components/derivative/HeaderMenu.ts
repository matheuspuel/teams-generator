import { getDefaultHeaderHeight } from '@react-navigation/elements'
import { Modal, View } from 'src/components'
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { named2 } from '../hyperscript'
import { Children } from '../types'

export const HeaderMenu = named2('HeaderMenu')(
  (props: { onClose: AppEvent }) => (children: Children) =>
    Modal({
      onClose: props.onClose,
      bg: Colors.cardSecondary,
      justify: 'start',
      align: 'end',
      m: 8,
      mt: getDefaultHeaderHeight({ height: 1, width: 0 }, false, 0),
    })([View({ py: 8 })(children)]),
)
