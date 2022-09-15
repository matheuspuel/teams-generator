/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EndpointBuilder,
  EndpointDefinition,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query'
import { pipe } from 'fp-ts/lib/function'
import { Rec } from 'src/utils/fp-ts'
import type { TagTypes } from './api'

type AppBuilder = EndpointBuilder<
  BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    object,
    FetchBaseQueryMeta
  >,
  TagTypes,
  'api'
>

export const defineEndpoint = <
  D extends EndpointDefinition<any, any, any, any>,
>(
  fn: (builder: AppBuilder) => D,
) => fn

export const combineEndpoints =
  <
    ES extends Record<
      string,
      (builder: AppBuilder) => EndpointDefinition<any, any, any, any>
    >,
  >(
    endpoints: ES,
  ) =>
  (builder: AppBuilder) =>
    pipe(
      endpoints,
      Rec.map(e => e(builder)),
    ) as {
      [key in keyof ES]: ReturnType<ES[key]>
    }
