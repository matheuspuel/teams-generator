import { $, R } from 'fp'
import {
  Fragment,
  MaterialIcons,
  Modal,
  Nothing,
  Pressable,
  Row,
  Txt,
  View,
} from 'src/components'
import { AppEvent, appEvents } from 'src/events'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { Children } from '../types'

export const CenterModal =
  (props: {
    onClose: AppEvent
    visible?: boolean
    title?: string
    m?: number
  }) =>
  (children: Children) =>
    Modal({
      transparent: true,
      flex: 1,
      animationType: 'fade',
      statusBarTranslucent: true,
      onRequestClose: props.onClose,
      visible: props.visible,
    })([
      Pressable({
        onPress: props.onClose,
        flex: 1,
        justify: 'center',
        bg: $(Colors.black, R.map(withOpacity(63))),
        rippleColor: Colors.black,
        rippleOpacity: 0,
      })([
        Pressable({
          onPress: appEvents.doNothing(),
          bg: Colors.white,
          m: props.m ?? 48,
          round: 8,
          shadow: 2,
          rippleColor: Colors.black,
          rippleOpacity: 0,
        })([
          props.title
            ? Fragment([
                Header({ title: props.title, onClose: props.onClose }),
                View({ borderWidthT: 1, borderColor: Colors.gray.$2 })([]),
              ])
            : Nothing,
          Fragment(children),
        ]),
      ]),
    ])

const Header = (props: { title: string; onClose: AppEvent }) =>
  Row({ align: 'center', p: 8 })([
    Txt({
      flex: 1,
      align: 'left',
      m: 8,
      size: 16,
      weight: 600,
      color: Colors.text.dark,
    })(props.title),
    Pressable({
      p: 8,
      round: 4,
      onPress: props.onClose,
    })([MaterialIcons({ name: 'close', color: Colors.gray.$4 })]),
  ])
