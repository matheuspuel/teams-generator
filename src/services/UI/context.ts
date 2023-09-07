import { UIColor } from 'src/components/types'
import { Colors } from '../Theme'

export type UIContext = {
  textColor: UIColor
}

export const initialUIContext: UIContext = {
  textColor: Colors.text.dark,
}
