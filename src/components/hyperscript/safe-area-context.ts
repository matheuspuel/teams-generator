import {
  SafeAreaProvider as SafeAreaProvider_,
  SafeAreaView as SafeAreaView_,
} from 'react-native-safe-area-context'
import { makeComponent } from './helpers'

export const SafeAreaView = makeComponent(SafeAreaView_)

export const SafeAreaProvider = makeComponent(SafeAreaProvider_)
