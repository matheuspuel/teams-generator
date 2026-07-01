import { getDefaultHeaderHeight } from '@react-navigation/elements'
import ExpoConstants from 'expo-constants'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import { Modal, View } from 'src/components'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'

const ANIMATION_DURATION = 150

export const HeaderMenu = (props: {
  onClose: AppEvent
  children: React.ReactNode
}) => (
  <Modal
    onClose={props.onClose}
    bg={Colors.cardSecondary}
    justify="start"
    align="end"
    m={8}
    mt={getDefaultHeaderHeight(
      { height: 1, width: 0 },
      false,
      ExpoConstants.statusBarHeight,
    )}
    entering={FadeIn.duration(ANIMATION_DURATION)}
    exiting={FadeOut.duration(ANIMATION_DURATION)}
  >
    <View py={8}>{props.children}</View>
  </Modal>
)
