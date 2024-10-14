import { Effect } from 'effect'
import * as ExpoSharing from 'expo-sharing'
import { Share as RNShare } from 'react-native'

export class ShareService extends Effect.Service<ShareService>()(
  'ShareService',
  {
    accessors: true,
    succeed: {
      shareMessage: (args: { title: string; message: string }) =>
        Effect.tryPromise(() => RNShare.share(args)).pipe(
          Effect.catchAll(() => Effect.void),
        ),
      shareFile: (args: { title: string; uri: string; mimeType?: string }) =>
        Effect.tryPromise(() =>
          ExpoSharing.shareAsync(args.uri, {
            dialogTitle: args.title,
            mimeType: args.mimeType,
          }),
        ).pipe(Effect.catchAll(() => Effect.void)),
    },
  },
) {}
