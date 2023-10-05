import { Colors } from 'src/services/Theme'
import { named2 } from '../hyperscript'
import { Txt } from '../react-native/Txt'

export const FormLabel: typeof Txt = named2('FormLabel')(props =>
  Txt({ align: 'left', weight: 500, color: Colors.gray.$4, my: 4, ...props }),
)
