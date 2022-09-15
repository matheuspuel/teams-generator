import { RootNavigatorObject } from 'src/routes/RootStack'
import { AuthHome } from './views/AuthHome'
import { BusinessInfo } from './views/BusinessInfo'
import { PersonalInfo } from './views/PersonalInfo'
import { PhoneNumberView } from './views/PhoneNumber'
import { VerificationCode } from './views/VerificationCode'

export type AuthGroupParamList = {
  'Auth/AuthHome': undefined
  'Auth/PhoneNumber': undefined
  'Auth/VerificationCode': undefined
  'Auth/PersonalInfo': undefined
  'Auth/BusinessInfo': undefined
}

export const AuthRoutes = (props: { Navigator: RootNavigatorObject }) => {
  const { Navigator } = props

  return (
    <Navigator.Group screenOptions={{ headerShown: false }}>
      <Navigator.Screen //
        name="Auth/AuthHome"
        component={AuthHome}
      />
      <Navigator.Screen //
        name="Auth/PhoneNumber"
        component={PhoneNumberView}
      />
      <Navigator.Screen //
        name="Auth/VerificationCode"
        component={VerificationCode}
      />
      <Navigator.Screen //
        name="Auth/PersonalInfo"
        component={PersonalInfo}
      />
      <Navigator.Screen //
        name="Auth/BusinessInfo"
        component={BusinessInfo}
      />
    </Navigator.Group>
  )
}
