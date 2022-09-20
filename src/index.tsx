import { StatusBar } from 'expo-status-bar'
import { NativeBaseProvider } from 'native-base'
import { Provider } from 'react-redux'
import { nbConfig, theme } from 'src/theme'
import { Splash } from 'src/views/Splash'
import store from './redux/store'
import Router from './routes'
import './utils/ignoreLogs'

export const AppIndex = () => (
  <Splash>
    <NativeBaseProvider theme={theme} config={nbConfig}>
      <StatusBar style="dark" />
      <Provider store={store}>
        <Router />
      </Provider>
    </NativeBaseProvider>
  </Splash>
)
