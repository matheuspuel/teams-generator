import { Effect } from 'effect'
import { BannerAdSize, TestIds } from 'react-native-google-mobile-ads'
import { Nothing, View } from 'src/components'
import { namedConst } from 'src/components/hyperscript'
import { useState } from 'src/hooks/useState'
import { matchEnv } from 'src/utils/Metadata'
import { RNGMABannerAd } from '../react-native-google-mobile-ads/BannerAd'

const adUnitId = matchEnv({
  development: TestIds.ADAPTIVE_BANNER,
  preview: TestIds.ADAPTIVE_BANNER,
  staging: TestIds.ADAPTIVE_BANNER,
  production: 'ca-app-pub-7021594781994811/2885202802',
})

export const BannerAd = namedConst('BannerAd')(() => {
  const isLoaded = useState(() => false)
  const isDismissed = useState(() => false)
  return isDismissed.value
    ? Nothing
    : View({ h: isLoaded.value ? undefined : 0 })([
        RNGMABannerAd({
          unitId: adUnitId,
          size: BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
          onAdLoaded: () => isLoaded.set(true).pipe(Effect.runSync),
        }),
        // Pressable({
        //   onPress: isDismissed.set(true),
        //   absolute: { top: 0, right: 0 },
        //   p: 2,
        // })([MaterialIcons({ name: 'close', color: Colors.gray, size: 18 })]),
      ])
})
