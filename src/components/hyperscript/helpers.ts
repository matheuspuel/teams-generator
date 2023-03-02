/* eslint-disable react/display-name */
import React from 'react'

export const makeComponentFromClass =
  <
    P extends { children?: unknown },
    T extends React.Component<P, React.ComponentState>,
    C extends React.ComponentClass<P>,
  >(
    type: React.ClassType<P, T, C>,
  ) =>
  (props?: (React.ClassAttributes<T> & P) | null) =>
  (children: ReadonlyArray<React.ReactNode>) =>
    React.createElement(type, props, ...children)

export const makeComponent =
  <P extends { children?: unknown }>(type: React.FunctionComponent<P>) =>
  (props?: (React.Attributes & P) | null) =>
  (children: ReadonlyArray<React.ReactNode>) =>
    React.createElement(type, props, ...children)

export const makeComponentFromClassWithoutChildren =
  <
    P extends object,
    T extends React.Component<P, React.ComponentState>,
    C extends React.ComponentClass<P>,
  >(
    type: React.ClassType<P, T, C>,
  ) =>
  (props?: (React.ClassAttributes<T> & P) | null) =>
    React.createElement(type, props)
