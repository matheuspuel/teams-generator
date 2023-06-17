import React from 'react'
import { TextInput as TextInput_ } from 'src/components/custom'
import { TextInputProps } from 'src/components/custom/react-native/TextInput'
import { Event, EventHandlerEnv } from 'src/events/helpers'

export const TextInput =
  <
    R,
    E1 extends Event,
    E2 extends Event = Event<never, never>,
    E3 extends Event = Event<never, never>,
  >(
    props: TextInputProps<R, E1, E2, E3>,
  ) =>
  // eslint-disable-next-line react/display-name
  (env: R & EventHandlerEnv<E1 | E2 | E3>) =>
    React.createElement(TextInput_<R, E1, E2, E3>, { x: props, env })
