import * as SplashScreen from 'expo-splash-screen'
import { number } from 'fp-ts'
import { isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { Divider, FlatList, Flex, Image, Text } from 'native-base'
import { serverUrl } from 'src/constants'
import { getPreviewServerUrl } from 'src/features/core/slices/preview'
import { api } from 'src/redux/api'
import { useAppSelector } from 'src/redux/store'
import { envName } from 'src/utils/Env'
import { A, O, Ord, S } from 'src/utils/fp-ts'

export const RealEstates = () => {
  const fieldsQ = api.endpoints.getAllRealEstateFields.useQuery()
  const realEstatesQ = api.endpoints.getAllRealEstates.useQuery()
  const baseUrl =
    (envName === 'production'
      ? serverUrl
      : useAppSelector(getPreviewServerUrl)) + '/api/v1'

  if (
    !fieldsQ.data ||
    isLeft(fieldsQ.data) ||
    !realEstatesQ.data ||
    isLeft(realEstatesQ.data)
  ) {
    return (
      <Flex
        flex={1}
        justify="center"
        align="center"
        onLayout={() => SplashScreen.hideAsync()}
      >
        <Text>error</Text>
      </Flex>
    )
  }

  const realEstates = pipe(
    realEstatesQ.data.right,
    A.sort(Ord.reverse(Ord.contramap((v: { id: string }) => v.id)(S.Ord))),
  )

  const allFields = pipe(
    fieldsQ.data.right,
    A.sort(Ord.contramap((v: { order: number }) => v.order)(number.Ord)),
  )
  console.log('realEstates', realEstates)

  return (
    <FlatList
      onLayout={() => SplashScreen.hideAsync()}
      data={realEstates}
      renderItem={({ item }) => (
        <Flex m="2" p="2" bg="white" rounded="lg" shadow="1">
          <Text>ID: {item.id}</Text>
          <Text>Images: </Text>
          {item.images.map(i => (
            <Flex key={i.assetId}>
              <Image
                source={{ uri: `${baseUrl}/assets/${i.assetId}` }}
                alt="Real estate image"
                h={100}
                w={100}
              />
            </Flex>
          ))}
          <Divider my="2" />
          <Text>Categoria: {item.status || ''}</Text>

          <Text>CEP: {item.address.cep || ''}</Text>
          <Text>City: {item.address.cityId || ''}</Text>
          <Text>Complement: {item.address.complement}</Text>
          <Text>Neighborhood: {item.address.neighborhood}</Text>
          <Text>Number: {item.address.number}</Text>
          <Text>Street: {item.address.street}</Text>
          <Divider my="2" />
          {pipe(
            item.fields,
            A.map(a =>
              pipe(
                allFields,
                A.findFirst(b => a.id === b.id),
                O.map(f => ({ ...a, field: f })),
              ),
            ),
            A.compact,
            A.map(f =>
              f.type === 'text' ? (
                <Flex key={f.field.id}>
                  <Text bold>{f.field.name}</Text>
                  <Text>{f.value}</Text>
                </Flex>
              ) : (
                pipe(
                  f.field.type === 'options' ? f.field.options : [],
                  A.findFirst(o => o.id === f.optionId),
                  O.matchW(
                    () => null,
                    o => (
                      <Flex key={f.field.id}>
                        <Text bold>{f.field.name}</Text>
                        <Text>{o.label}</Text>
                      </Flex>
                    ),
                  ),
                )
              ),
            ),
          )}
        </Flex>
      )}
    />
  )
}
