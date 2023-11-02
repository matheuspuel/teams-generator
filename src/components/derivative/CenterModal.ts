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
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { F } from 'src/utils/fp'
import { named2 } from '../hyperscript'
import { Children } from '../types'

export const CenterModal = named2('CenterModal')(
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
          bg: Colors.opacity(0.25)(Colors.black),
          rippleColor: Colors.black,
          rippleOpacity: 0,
        })([
          Pressable({
            onPress: F.unit,
            bg: Colors.card,
            m: props.m ?? 48,
            round: 8,
            shadow: 2,
            rippleColor: Colors.black,
            rippleOpacity: 0,
          })([
            props.title
              ? Fragment([
                  Header({ title: props.title, onClose: props.onClose }),
                  View({
                    borderWidthT: 1,
                    borderColor: Colors.opacity(0.375)(Colors.gray),
                  })([]),
                ])
              : Nothing,
            Fragment(children),
          ]),
        ]),
      ]),
)

const Header = (props: { title: string; onClose: AppEvent }) =>
  Row({ align: 'center', p: 8 })([
    Txt({
      flex: 1,
      align: 'left',
      m: 8,
      size: 16,
      weight: 600,
    })(props.title),
    Pressable({
      p: 8,
      round: 4,
      onPress: props.onClose,
    })([MaterialIcons({ name: 'close', color: Colors.gray })]),
  ])
