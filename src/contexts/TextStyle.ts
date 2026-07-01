import * as React from 'react'
import { UIColor } from 'src/components/types'
import { Colors } from 'src/services/Theme'

export type TextStyleContext = { color: UIColor }

export const TextStyleContext = React.createContext<TextStyleContext>({
  color: Colors.text.normal,
})

export const useTextStyle = () => React.useContext(TextStyleContext)
