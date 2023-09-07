import { Colors } from 'src/services/Theme'
import { named3 } from '../helpers'
import { Txt } from '../react-native/Txt'

export const FormLabel: typeof Txt = named3('FormLabel')(props =>
  Txt({ align: 'left', weight: 500, color: Colors.gray.$4, my: 4, ...props }),
)
