import { O } from 'fp'
import { SafeAreaService } from '.'

export const testingSafeAreaService: SafeAreaService = {
  initialMetrics: O.some({
    frame: {
      width: 320,
      height: 640,
      x: 0,
      y: 0,
    },
    insets: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
    },
  }),
}