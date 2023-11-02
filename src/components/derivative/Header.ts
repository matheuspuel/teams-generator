import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import { Colors } from 'src/services/Theme'
import { named } from '../hyperscript'
import { HeaderComponent, HeaderProps } from '../navigation/Header'

export const Header = named('Header')((props: HeaderProps) =>
  TextStyleContextProvider({ color: Colors.text.light })([
    HeaderComponent({
      headerStyle: { backgroundColor: Colors.primary },
      ...props,
    }),
  ]),
)
