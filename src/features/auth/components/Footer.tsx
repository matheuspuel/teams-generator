import { Flex, Text } from 'native-base'
import React from 'react'
import { appVersionName } from 'src/constants'

export const Footer = () => {
  return (
    <Flex align="center" px="2" py="1">
      <FooterText>{appVersionName}</FooterText>
      <FooterText>contato@sociocorretordeimoveis.com.br</FooterText>
      <FooterText>+55 (47) 3396-0000</FooterText>
      <FooterText>© 2022 Sócio Corretor de Imóveis</FooterText>
    </Flex>
  )
}

const FooterText = (props: React.ComponentProps<typeof Text>) => (
  <Text fontSize="2xs" {...props} />
)
