import 'react-native-gesture-handler'

import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Pressable } from './components/animated/Pressable'
import { Slider } from './components/animated/Slider'

export const AppIndex = () => {
  return (
    <GestureHandlerRootView>
      <View style={{ paddingVertical: 100, paddingHorizontal: 16 }}>
        <Pressable onPress={() => console.log('pressed')}>
          <Text style={{ textAlign: 'center' }}>abcd</Text>
        </Pressable>
        <Slider step={0.05} onChange={p => () => console.log(p * 10)} />
      </View>
    </GestureHandlerRootView>
  )
}
