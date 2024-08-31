import * as React from 'react'
import { BannerAd as RNGMABannerAd_ } from 'react-native-google-mobile-ads'
import { named } from 'src/components/hyperscript'

export const RNGMABannerAd = named('RNGMABannerAd')(
  (props: React.ComponentProps<typeof RNGMABannerAd_>) =>
    React.createElement(RNGMABannerAd_, props),
)
