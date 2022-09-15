import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { absurd } from 'fp-ts/lib/function'
import {
  AddIcon,
  AspectRatio,
  Avatar,
  Button,
  Divider,
  FlatList,
  Flex,
  Image,
  Menu,
  Pressable,
  Text,
} from 'native-base'
import { useLayoutEffect } from 'react'
import headerLogo from 'src/assets/img/header-logo-white.png'
import { t } from 'src/i18n'
import { realEstates } from 'src/mocks/data/RealEstate'
import { logout } from 'src/redux/api'
import { useAppDispatch } from 'src/redux/store'
import { AppDrawerScreenProps } from 'src/routes/Drawer'

export const Home = (props: AppDrawerScreenProps<'Core/Home'>) => {
  const { navigation } = props
  const dispatch = useAppDispatch()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          h="10"
          resizeMode="contain"
          alt="Sócio Corretor"
          source={headerLogo}
        />
      ),
      headerRight: () => (
        <Menu
          placement="bottom right"
          trigger={triggerProps => {
            return (
              <Pressable accessibilityLabel={t('profile')} {...triggerProps}>
                <Avatar
                  mx="2"
                  size="10"
                  source={{ uri: 'https://github.com/matheuspuel.png' }}
                >
                  JG
                </Avatar>
              </Pressable>
            )
          }}
        >
          <Menu.Item>{t('account_settings')}</Menu.Item>
          <Divider my="2" w="100%" />
          <Menu.Item
            _text={{ color: 'danger.600' }}
            onPress={() => {
              dispatch(logout())
            }}
          >
            {t('logout')}
          </Menu.Item>
        </Menu>
      ),
    })
  }, [])

  return (
    <Flex flex={1} onLayout={() => SplashScreen.hideAsync()}>
      <StatusBar style="light" />
      <Indicators />
      <FlatList
        flex={1}
        data={realEstates}
        renderItem={({ item, index }) => <Item key={index} item={item} />}
      />
      <Footer />
    </Flex>
  )
}

const Item = (props: {
  item: {
    type: 'house' | 'apartment'
    imageUri: string
    city: string
    area: number
    bathrooms: number
    status: 'active' | 'underAnalysis' | 'negotiating'
  }
}) => {
  const { type, imageUri, city, area, bathrooms, status } = props.item

  return (
    <Flex flex={1} m="2" backgroundColor="gray.50" rounded="lg" shadow="2">
      <AspectRatio w="100%" ratio={16 / 9}>
        <Image
          source={{ uri: imageUri }}
          alt={`${t(type)} in ${city}`}
          borderTopRadius="lg"
        />
      </AspectRatio>
      <Flex p="2">
        <Flex direction="row" justify="space-between" align="center">
          <Text bold fontSize="lg">
            {t(type)}
          </Text>
          <Text bold>
            {t('city')}: <Text>{city}</Text>
          </Text>
        </Flex>
        <Text
          fontSize="xs"
          bold
          color={
            status === 'active'
              ? 'primary.700'
              : status === 'negotiating'
              ? 'success.700'
              : status === 'underAnalysis'
              ? 'warning.700'
              : absurd(status)
          }
        >
          {status === 'active'
            ? t('active')
            : status === 'negotiating'
            ? t('negotiating')
            : status === 'underAnalysis'
            ? t('under_analysis')
            : absurd(status)}
        </Text>
        <Flex direction="row">
          <Text flex={1}>
            {t('area')}: <Text>{area} m²</Text>
          </Text>
          <Text flex={1}>
            {t('bathrooms')}: <Text>{bathrooms}</Text>
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

const Indicators = () => {
  return (
    <Flex direction="row" align="stretch" m="1">
      <Indicator title={t('real_estates')} value={16} />
      <Indicator title={t('under_analysis')} value={2} />
      <Indicator title={t('negotiating')} value={4} />
    </Flex>
  )
}

const Indicator = (props: { value: number; title: string }) => {
  const { title, value } = props

  return (
    <Flex
      flex={1}
      m="1"
      p="2"
      backgroundColor="gray.50"
      rounded="lg"
      shadow="2"
    >
      <Text textAlign="center" bold fontSize="lg">
        {value}
      </Text>
      <Text textAlign="center">{title}</Text>
    </Flex>
  )
}

const Footer = () => {
  return <Button leftIcon={<AddIcon />}>{t('add_real_estate')}</Button>
}
