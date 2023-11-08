import { Clock, F, pipe } from 'fp'
import { Linking } from 'src/services/Linking'
import { Metadata } from 'src/services/Metadata'
import { Telemetry } from 'src/services/Telemetry'

const sponsorUrl = 'https://rebrand.ly/st-gdaps'

export const openSponsorUrl = () =>
  pipe(
    Linking.openURL(sponsorUrl),
    F.tap(() =>
      pipe(
        F.all({ meta: Metadata.get(), time: Clock.currentTimeMillis }),
        F.flatMap(({ meta, time }) =>
          Telemetry.log([
            {
              timestamp: time,
              event: 'openSponsorUrl',
              data: {
                metadata: {
                  installation: meta.installation,
                  launch: meta.launch,
                },
              },
            },
          ]),
        ),
        F.flatMap(() => Telemetry.send()),
        F.ignore,
      ),
    ),
  )
