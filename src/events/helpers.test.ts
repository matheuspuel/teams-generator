/* eslint-disable functional/no-expression-statements */
import { $, Context, Eff } from 'fp'
import { Event, makeEventConstructors, makeEventHandler } from './helpers'

const makeEvent =
  <T extends string>(tag: T) =>
  <P>(payload: P): Event<T, P> => ({
    _tag: 'Event',
    event: { _tag: tag, payload },
  })

const ignore = (_: unknown) => Eff.unit()

describe('makeEventConstructors', () => {
  test('makes', () => {
    expect(
      makeEventConstructors({
        a: ignore,
      })().a(0),
    ).toStrictEqual(makeEvent('a')(0))
    expect(
      makeEventConstructors({
        a: { b: { c: ignore } },
      })().a.b.c(0),
    ).toStrictEqual(makeEvent('a.b.c')(0))
  })
})

describe('makeEventHandler', () => {
  test('makes', () => {
    // eslint-disable-next-line functional/no-let
    let info: unknown
    const rEnv = Context.Tag()
    $(
      makeEventHandler({
        a: ignore,
        b: {
          ba: (p: unknown) =>
            $(
              rEnv,
              Eff.flatMap(r =>
                Eff.sync(() => {
                  info = [p, r]
                }),
              ),
            ),
          bb: ignore,
        },
      })(makeEvent('b.ba')(1)),
      Eff.provideService(rEnv, 2),
      Eff.runSync,
    )
    expect(info).toStrictEqual([1, 2])
  })
})
