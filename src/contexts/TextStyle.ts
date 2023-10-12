import * as React from 'react'
import { named2 } from 'src/components/hyperscript'
import { Children, UIColor } from 'src/components/types'
import { Colors } from 'src/services/Theme'

export type TextStyleContext = { color: UIColor }

export const TextStyleContext = React.createContext<TextStyleContext>({
  color: Colors.text.dark,
})

export const useTextStyle = () => React.useContext(TextStyleContext)

export const TextStyleContextProvider = named2('TextStyleContextProvider')(
  // eslint-disable-next-line react/display-name
  (value: TextStyleContext) => (children: Children) =>
    React.createElement(TextStyleContext.Provider, { value }, ...children),
)
