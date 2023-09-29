import { A, Data, Match, O } from 'fp'
import { Nothing } from 'src/components'
import { AlertToast } from 'src/components/derivative/AlertToast'
import { StatusBar } from 'src/components/expo/StatusBar'
import { named1 } from 'src/components/helpers'
import { SafeAreaProvider } from 'src/components/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/screens/Screen'
import { ScreenStack } from 'src/components/screens/ScreenStack'
import { select } from 'src/services/StateRef/react'
import { Colors } from 'src/services/Theme'
import { GroupView } from 'src/views/Group'
import { Groups } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'

export const Router = named1('Router')(
  select(s => Data.struct({ route: s.route, alert: s.alert }))(s =>
    SafeAreaProvider({ bg: Colors.background })([
      StatusBar({ style: 'light' }),
      ScreenStack()(
        A.map(
          s.route,
          Match.valueTags({
            Groups: () => Screen()([Groups]),
            Group: () => Screen()([GroupView]),
            Player: () => Screen()([PlayerView]),
            Result: () => Screen()([ResultView]),
          }),
        ),
      ),
      O.match(s.alert, {
        onNone: () => Nothing,
        onSome: alert => AlertToast(alert),
      }),
    ]),
  ),
)
