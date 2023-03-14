import HeaderBackButton_ from '@react-navigation/elements/src/Header/HeaderBackButton'
import { colors } from 'src/theme'
import { Color, toHex } from 'src/utils/Color'
import { IO } from 'src/utils/fp'

export const HeaderBackButton = (props: {
  onPress: IO<void>
  tintColor?: Color
}) => (
  <HeaderBackButton_
    {...{
      ...props,
      tintColor: toHex(props.tintColor ?? colors.white),
    }}
  />
)
