import { Color } from 'src/utils/datatypes'
import { UIEnv } from '.'
import { Colors } from '../Theme'

export type UIContext = {
  textColor: (env: UIEnv) => Color
}

export const initialUIContext: UIContext = {
  textColor: Colors.text.dark,
}
