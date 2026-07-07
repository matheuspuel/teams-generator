import 'fast-text-encoding'
import 'react-native-gesture-handler'

import { startApp } from 'src/app'
import { runtime } from './runtime'

void runtime.runPromiseExit(startApp)

import 'expo-router/entry'
