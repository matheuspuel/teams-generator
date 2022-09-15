import * as SplashScreen from 'expo-splash-screen'
import { Flex, KeyboardAvoidingView, ScrollView } from 'native-base'
import React from 'react'
import { Platform } from 'react-native'
import { Footer } from './Footer'
import { HeaderLogo } from './HeaderLogo'
import { Links } from './Links'

export const RegisterContainer = (props: {
  children: React.ReactNode
  withHeader?: boolean
}) => {
  return (
    <Flex flex={1} safeArea onLayout={() => SplashScreen.hideAsync()}>
      <KeyboardAvoidingView
        flex={1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          flex={1}
          _contentContainerStyle={{ flexGrow: 1, p: '2' }}
          keyboardShouldPersistTaps="handled"
        >
          {props.withHeader && (
            <>
              <Flex flex={1} />
              <HeaderLogo />
              <Flex flex={1} />
            </>
          )}
          {props.children}
          <Flex flex={1} />
          <Links />
          <Flex flex={0.5} />
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </Flex>
  )
}
