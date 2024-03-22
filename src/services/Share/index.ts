import { Effect } from 'effect'

export type ShareServiceImplementation = {
  shareMessage: (args: {
    title: string
    message: string
  }) => Effect.Effect<void>
  shareFile: (args: {
    title: string
    uri: string
    mimeType?: string
  }) => Effect.Effect<void>
}

export class ShareService extends Effect.Tag('ShareService')<
  ShareService,
  ShareServiceImplementation
>() {}
