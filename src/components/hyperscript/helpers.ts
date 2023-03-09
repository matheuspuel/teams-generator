/* eslint-disable react/display-name */
import React from 'react'
import { $, apply, RA } from 'src/utils/fp'

export const makeComponent =
  <P extends { children?: unknown }>(type: React.FunctionComponent<P>) =>
  (props?: (React.Attributes & P) | null) =>
  <R>(
    children: ReadonlyArray<
      (
        env: R,
      ) =>
        | Exclude<
            React.ReactNode &
              React.ComponentProps<React.FunctionComponent<P>>['children'],
            Iterable<unknown>
          >
        | Extract<
            React.ComponentProps<React.FunctionComponent<P>>['children'],
            string
          >
    >,
  ) =>
  (env: R) =>
    React.createElement(type, props, ...$(children, RA.map(apply(env))))

export const makeComponentWithoutChildren =
  <P extends object>(type: React.FunctionComponent<P>) =>
  (props?: (React.Attributes & P) | null) =>
  (_env: unknown) =>
    React.createElement(type, props)

export const makeComponentFromClass =
  <
    P extends { children?: unknown },
    T extends React.Component<P, React.ComponentState>,
    C extends React.ComponentClass<P>,
  >(
    type: React.ClassType<P, T, C>,
  ) =>
  (props?: (React.ClassAttributes<T> & P) | null) =>
  <R>(
    children: ReadonlyArray<
      (
        env: R,
      ) =>
        | Exclude<
            React.ReactNode & React.ComponentProps<C>['children'],
            Iterable<unknown>
          >
        | Extract<React.ComponentProps<C>['children'], string>
    >,
  ) =>
  (env: R) =>
    React.createElement(type, props, ...$(children, RA.map(apply(env))))

export const makeComponentFromClassWithoutChildren =
  <
    P extends object,
    T extends React.Component<P, React.ComponentState>,
    C extends React.ComponentClass<P>,
  >(
    type: React.ClassType<P, T, C>,
  ) =>
  (props?: (React.ClassAttributes<T> & P) | null) =>
  (_env: unknown) =>
    React.createElement(type, props)
