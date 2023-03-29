import HeaderBackButton_ from '@react-navigation/elements/src/Header/HeaderBackButton'
import { defaultColors } from 'src/services/Theme/default'
import { Color, toHex } from 'src/utils/datatypes/Color'
import { IO } from 'src/utils/fp'

export const HeaderBackButton = (props: {
  onPress: IO<void>
  tintColor?: Color
}) => (
  <HeaderBackButton_
    {...{
      ...props,
      tintColor: toHex(props.tintColor ?? defaultColors.white),
    }}
  />
)
