import { constant, pipe } from 'fp-ts/lib/function'
import { Flex, Heading, Text } from 'native-base'
import { getRealtorData } from 'src/features/realtor/slices/realtor'
import { useAppSelector } from 'src/redux/store'
import { O } from 'src/utils/fp-ts'

export const NotImplemented = () => {
  const realtorOp = useAppSelector(getRealtorData)

  return (
    <Flex flex={1} justify="center" align="center">
      <Text>Not implemented</Text>
      <Heading>Realtor Data</Heading>
      {pipe(
        realtorOp,
        O.matchW(constant(<Text>No data</Text>), r => (
          <>
            <Text>Name: {r.name}</Text>
            <Text>Website slug: {O.toNullable(r.websiteSlug)}</Text>
            <Text>Phones: {r.contacts.phones.join(', ')}</Text>
            <Text>Emails: {r.contacts.emails.join(', ')}</Text>
          </>
        )),
      )}
    </Flex>
  )
}
