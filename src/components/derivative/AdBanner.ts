import { MaterialIcons, Nothing, Pressable, View } from 'src/components'
import { namedConst } from 'src/components/hyperscript'
import { useState } from 'src/hooks/useState'
import { AdsWidget } from '../custom/AdsWidget'

export const AdBanner = namedConst('AdsWidget')(() => {
  const isOpen = useState(() => true)
  return !isOpen.value
    ? Nothing
    : View({})([
        AdsWidget({ scriptId: '79584', width: null, height: 250 }),
        Pressable({
          onPress: isOpen.set(false),
          absolute: { top: 0, right: 0 },
          p: 4,
        })([MaterialIcons({ name: 'close' })]),
      ])
})
