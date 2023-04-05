import React from 'react'
import { Event, EventHandlerEnv } from 'src/actions'
import { TextInput as TextInput_ } from 'src/components/custom'
import { TextInputProps } from 'src/components/custom/react-native/TextInput'

export const TextInput =
  <
    R,
    E1 extends Event<string, unknown>,
    E2 extends Event<string, unknown> = Event<never, never>,
    E3 extends Event<string, unknown> = Event<never, never>,
  >(
    props: TextInputProps<R, E1, E2, E3>,
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R & EventHandlerEnv<E1 | E2 | E3>) =>
    React.createElement(TextInput_<R, E1, E2, E3>, { x: props, env })
