/* eslint-disable functional/no-expression-statements */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).ReanimatedDataMock = { now: () => 0 }

import { act, create } from 'react-test-renderer'
import { GroupOrder, Parameters } from 'src/datatypes'
import { Abbreviation } from 'src/datatypes/Position'
import { AppEvent, appEvents as on } from 'src/events'
import { AlertLive } from 'src/services/Alert/default'
import { BackHandlerEnv } from 'src/services/BackHandler'
import { DocumentPickerEnv } from 'src/services/DocumentPicker'
import { FileSystemEnv } from 'src/services/FileSystem'
import { IdGeneratorEnv } from 'src/services/IdGenerator'
import { LinkingEnv } from 'src/services/Linking'
import { MetadataServiceEnv } from 'src/services/Metadata'
import { RepositoryEnv } from 'src/services/Repositories/tag'
import { SafeAreaServiceTest } from 'src/services/SafeArea/testing'
import { ShareServiceEnv } from 'src/services/Share'
import { SplashScreenEnv } from 'src/services/SplashScreen'
import { StateRefLive } from 'src/services/StateRef/default'
import { TelemetryEnv } from 'src/services/Telemetry'
import { AppThemeLive } from 'src/services/Theme/default'
import { Id } from 'src/utils/Entity'
import { Clock, F, Layer, Number, Ref, Stream, pipe } from 'src/utils/fp'
import { UIRoot } from '.'

const testLayer = pipe(
  Layer.mergeAll(
    F.setClock(
      Clock.Clock.of({
        [Clock.ClockTypeId]: Clock.ClockTypeId,
        currentTimeMillis: F.succeed(0),
        currentTimeNanos: F.succeed(BigInt(0)),
        sleep: () => F.unit,
        unsafeCurrentTimeMillis: () => 0,
        unsafeCurrentTimeNanos: () => BigInt(0),
      }),
    ),
    StateRefLive,
    BackHandlerEnv.context({
      exit: () => F.unit,
      stream: Stream.never,
    }).pipe(Layer.succeedContext),
    FileSystemEnv.context({
      write: () => F.unit,
      read: () => F.succeed(''),
      copy: () => F.unit,
      cacheDirectory: () => F.succeed(''),
    }).pipe(Layer.succeedContext),
    DocumentPickerEnv.context({
      getDocument: () => F.succeed({ uri: '' }),
    }).pipe(Layer.succeedContext),
    ShareServiceEnv.context({
      shareMessage: () => F.unit,
      shareFile: () => F.unit,
    }).pipe(Layer.succeedContext),
    SplashScreenEnv.context({
      hide: () => F.unit,
      preventAutoHide: () => F.unit,
    }).pipe(Layer.succeedContext),
    IdGeneratorEnv.context({
      generate: pipe(
        Ref.make(0).pipe(F.runSync),
        ref => () =>
          pipe(
            Ref.get(ref),
            F.map(Number.increment),
            F.tap(v => Ref.set(ref, v)),
            F.map(n => Id(n.toString())),
          ),
      ),
    }).pipe(Layer.succeedContext),
    TelemetryEnv.context({ log: () => F.unit, send: () => F.unit }).pipe(
      Layer.succeedContext,
    ),
    MetadataServiceEnv.context({
      get: () =>
        F.succeed({
          application: {
            native: { buildVersion: null, version: null },
            version: 'test',
          },
          device: {
            modelName: null,
            osVersion: null,
            platformApiLevel: null,
          },
          installation: { id: '' },
          launch: { id: '' },
          isFirstLaunch: false,
        }),
    }).pipe(Layer.succeedContext),
    RepositoryEnv.context({
      teams: {
        Groups: { get: () => F.succeed({}), set: () => F.unit },
        Parameters: {
          get: () => F.succeed(Parameters.initial),
          set: () => F.unit,
        },
        GroupOrder: {
          get: () => F.succeed(GroupOrder.initial),
          set: () => F.unit,
        },
        Modality: { get: () => F.never, set: () => F.never },
      },
      metadata: {
        Installation: { get: () => F.never, set: () => F.unit },
        StorageVersion: { get: () => F.never, set: () => F.never },
      },
      telemetry: {
        Log: {
          get: () => F.never,
          concat: () => F.unit,
          clear: () => F.unit,
        },
      },
    }).pipe(Layer.succeedContext),
    AppThemeLive,
    LinkingEnv.context({
      getInitialURL: () => F.never,
      startLinkingStream: () => Stream.never,
    }).pipe(Layer.succeedContext),
    SafeAreaServiceTest,
  ),
  Layer.provideMerge(AlertLive),
)

const dispatch = (e: AppEvent) => e.pipe(F.provide(testLayer), F.runPromise)

it('renders', async () => {
  await dispatch(on.core.appLoaded())

  const UI = UIRoot

  const ui = create(UI)
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.groups.item.upsert.new())
    await dispatch(on.groups.item.upsert.form.name.change('group 1'))
    await dispatch(on.groups.item.upsert.submit())
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.groups.item.open(Id('1')))
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.group.player.new())
  })
  expect(ui.toJSON()).toMatchSnapshot()
  await act(async () => {
    await dispatch(on.player.name.change('player 1'))
    await dispatch(on.player.position.change(Abbreviation('g')))
    await dispatch(on.player.rating.change(1.5))
    await dispatch(on.player.save())
    await dispatch(on.group.parameters.open())
    await dispatch(on.group.parameters.shuffle())
  })
  expect(ui.toJSON()).toMatchSnapshot()
})
