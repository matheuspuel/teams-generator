import * as React from 'react'
import { DimensionValue } from 'react-native'
import CleverAdsWidget from 'react-native-ads-package/CleverAdsWidget'
import { named } from 'src/components/hyperscript'

export const AdsWidget = named('AdsWidget')(
  (props: {
    scriptId: string
    width: DimensionValue
    height: DimensionValue
  }) => React.createElement(CleverAdsWidget, props),
)
