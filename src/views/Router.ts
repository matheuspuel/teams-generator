import { A, Match, pipe } from 'fp'
import { StatusBar } from 'src/components/expo/StatusBar'
import { memoizedConst } from 'src/components/helpers'
import { SafeAreaProvider } from 'src/components/safe-area/SafeAreaProvider'
import { Screen } from 'src/components/screens/Screen'
import { ScreenStack } from 'src/components/screens/ScreenStack'
import { useSelector } from 'src/hooks/useSelector'
import { Colors } from 'src/services/Theme'
import { GroupView } from 'src/views/Group'
import { Groups } from 'src/views/Groups'
import { PlayerView } from 'src/views/PlayerForm'
import { ResultView } from 'src/views/Result'

export const Router = memoizedConst('Router')(() => {
  const route = useSelector(s => s.route)
  return SafeAreaProvider({ bg: Colors.background })([
    StatusBar({ style: 'light' }),
    pipe(
      A.map(
        route,
        Match.valueTags({
          Groups: () => Groups,
          Group: () => GroupView,
          Player: () => PlayerView,
          Result: () => ResultView,
        }),
      ),
      A.map(view => Screen()([view])),
      ScreenStack(),
    ),
  ])
})
