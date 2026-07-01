import { TextStyleContext } from 'src/contexts/TextStyle'
import { Colors } from 'src/services/Theme'
import { HeaderComponent, HeaderProps } from '../navigation/Header'

export const Header = (props: HeaderProps) => (
  <TextStyleContext.Provider value={{ color: Colors.text.light }}>
    <HeaderComponent
      headerStyle={{ backgroundColor: Colors.header }}
      {...props}
    />
  </TextStyleContext.Provider>
)
