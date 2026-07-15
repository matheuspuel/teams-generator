import * as React from 'react'
import type { Color } from 'src/utils/datatypes/Color'
import { useTheme } from './Theme'

export type TextStyleContextValue = { color: Color }

const TextStyleContext = React.createContext<TextStyleContextValue | null>(null)

export const TextStyleContextProvider = TextStyleContext.Provider

export const useTextStyle = () => {
  const theme = useTheme()
  const contextValue = React.useContext(TextStyleContext)
  const value = React.useMemo(
    () => contextValue ?? { color: theme.colors.text.normal },
    [contextValue, theme.colors.text.normal],
  )
  return value
}
