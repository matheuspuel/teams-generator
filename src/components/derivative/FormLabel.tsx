import { useTheme } from 'src/contexts/Theme'
import { Txt } from '../react-native/Txt'

export const FormLabel: typeof Txt = props => {
  const { colors } = useTheme()
  return (
    <Txt
      align="left"
      weight={500}
      color={colors.text.secondary}
      my={4}
      {...props}
    />
  )
}
