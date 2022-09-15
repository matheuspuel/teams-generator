import { CEP, CityId } from '@common/src/datatypes/Address'
import { NumberFromString } from '@common/src/datatypes/Number'
import { NonEmptyString } from '@common/src/datatypes/String'
import { fromEnumFromPrimitive } from '@common/src/utils/Enum'
import { RealEstateStatus } from '@server/src/modules/realtor/entities/RealEstate'
import {
  RealEstateFieldCategory,
  RealEstateFieldId,
  RealEstateFieldOptionId,
} from '@server/src/modules/realtor/entities/RealEstateField'
import * as ImagePicker from 'expo-image-picker'
import * as SplashScreen from 'expo-splash-screen'
import { isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as N from 'fp-ts/number'
import { compose, draw, fromStruct, id } from 'io-ts/lib/Decoder'
import {
  Button,
  CheckIcon,
  Flex,
  Image,
  Input,
  Radio,
  ScrollView,
  Select,
  Text,
} from 'native-base'
import { useState } from 'react'
import { uploadImage } from 'src/features/assets/upload'
import { api } from 'src/redux/api'
import { useAppDispatch } from 'src/redux/store'
import { A, E, Ord, RA } from 'src/utils/fp-ts'

export const CreateRealEstate = () => {
  const dispatch = useAppDispatch()
  const fieldsQ = api.endpoints.getAllRealEstateFields.useQuery()
  const kindsQ = api.endpoints.getAllRealEstateKinds.useQuery()
  const [kindId, setKindId] = useState<string>('cl6z9tia100nf34zscm428sy9')
  const [choices, setChoices] = useState<
    { field: RealEstateFieldId; option: RealEstateFieldOptionId }[]
  >([])
  const [values, setValues] = useState<
    { field: RealEstateFieldId; value: string }[]
  >([])
  const [createRealEstate] = api.endpoints.createRealEstate.useMutation()
  const [images, setImages] = useState<ImagePicker.ImageInfo[]>([])

  const [status, setStatus] = useState<RealEstateStatus | null>(null)

  const [cep, setCep] = useState('')
  const [cityId, setCityId] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [number, setNumber] = useState('')
  const [street, setStreet] = useState('')

  console.log('status', status)

  if (
    !fieldsQ.data ||
    isLeft(fieldsQ.data) ||
    !kindsQ.data ||
    isLeft(kindsQ.data)
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

  const kinds = kindsQ.data.right

  const kind = kinds.find(k => k.id === kindId)

  const fields = pipe(
    fieldsQ.data.right,
    A.filter(f => kind !== undefined && kind.fieldIds.includes(f.id)),
    A.sort(Ord.contramap((v: { order: number }) => v.order)(N.Ord)),
  )

  const sections = pipe(
    fields,
    A.reduce(
      {},
      (prev: Partial<Record<RealEstateFieldCategory, typeof fields>>, cur) => ({
        ...prev,
        [cur.category]: [...(prev[cur.category] ?? []), cur],
      }),
    ),
  )

  const Field = (f: typeof fields[number]) => (
    <Flex key={f.id}>
      <Text bold>{f.name}</Text>
      {f.type === 'options' ? (
        <Radio.Group
          name={f.id}
          accessibilityLabel={f.name}
          value={choices.find(d => d.field === f.id)?.option || ''}
          onChange={t => {
            const optionId = RealEstateFieldOptionId.FromString.decode(t)
            if (isLeft(optionId)) return
            setChoices(prev => [
              ...prev.filter(d => d.field !== f.id),
              { field: f.id, option: optionId.right },
            ])
          }}
          flexDirection="row"
          flexWrap="wrap"
        >
          {f.options.map(o => (
            <Radio key={o.id} value={o.id} my="3" _text={{ mr: '4' }}>
              {o.label}
            </Radio>
          ))}
        </Radio.Group>
      ) : (
        <Input
          value={values.find(v => v.field === f.id)?.value}
          onChangeText={t =>
            setValues(prev => [
              ...prev.filter(v => v.field !== f.id),
              { field: f.id, value: t },
            ])
          }
        />
      )}
    </Flex>
  )

  return (
    <ScrollView
      flex={1}
      onLayout={() => SplashScreen.hideAsync()}
      _contentContainerStyle={{ p: 2 }}
    >
      <Button
        onPress={async () => {
          const image = (await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
          })) as ImagePicker.ImagePickerMultipleResult | ImagePicker.ImageInfo
          if (image.cancelled) return
          setImages(p => [
            ...p,
            ...('selected' in image ? image.selected : [image]),
          ])
        }}
      >
        Add Image
      </Button>
      {images.map((i, k) => (
        <Image
          key={k + ''}
          src={i.uri}
          alt={'Real estate image'}
          width={100}
          height={100}
        />
      ))}

      <Radio.Group
        name="status"
        accessibilityLabel="Categoria"
        value={status === null ? 'none' : status + ''}
        onChange={t => {
          if (t === 'none') return setStatus(null)
          const opStatus = fromEnumFromPrimitive(RealEstateStatus).decode(+t)
          if (isLeft(opStatus)) return
          setStatus(opStatus.right)
        }}
        flexDirection="row"
        flexWrap="wrap"
      >
        <Radio
          value={RealEstateStatus.SecondHand + ''}
          my="3"
          _text={{ mr: '4' }}
        >
          Imóvel Usado
        </Radio>
        <Radio value={RealEstateStatus.New + ''} my="3" _text={{ mr: '4' }}>
          Imóvel Novo
        </Radio>
        <Radio
          value={RealEstateStatus.UnderConstruction + ''}
          my="3"
          _text={{ mr: '4' }}
        >
          Imóvel em Construção
        </Radio>
        <Radio
          value={RealEstateStatus.PreRelease + ''}
          my="3"
          _text={{ mr: '4' }}
        >
          Imóvel na Planta
        </Radio>
      </Radio.Group>

      <Input value={cep} onChangeText={t => setCep(t)} placeholder="CEP" />
      <Input
        value={cityId}
        onChangeText={t => setCityId(t)}
        placeholder="City"
      />
      <Input
        value={complement}
        onChangeText={t => setComplement(t)}
        placeholder="Complement"
      />
      <Input
        value={neighborhood}
        onChangeText={t => setNeighborhood(t)}
        placeholder="Neighborhood"
      />
      <Input
        value={number}
        onChangeText={t => setNumber(t)}
        placeholder="Number"
      />
      <Input
        value={street}
        onChangeText={t => setStreet(t)}
        placeholder="Street"
      />

      <Text bold>Real Estate Kind</Text>
      <Select
        selectedValue={kindId}
        minWidth="200"
        accessibilityLabel="Choose real estate kind"
        placeholder="Choose real estate kind"
        _selectedItem={{
          bg: 'primary.200',
          endIcon: <CheckIcon size="5" />,
        }}
        mt={1}
        onValueChange={itemValue => setKindId(itemValue)}
      >
        {kinds.map(k => (
          <Select.Item key={k.id} value={k.id} label={k.name} />
        ))}
      </Select>

      <Text textAlign="center" fontSize="lg" bold>
        Real Estate
      </Text>
      {sections[0]?.map(Field)}
      <Text textAlign="center" fontSize="lg" bold>
        Forniture
      </Text>
      {sections[1]?.map(Field)}
      <Text textAlign="center" fontSize="lg" bold>
        Construction
      </Text>
      {sections[2]?.map(Field)}
      <Text textAlign="center" fontSize="lg" bold>
        Recreation
      </Text>
      {sections[3]?.map(Field)}
      <Text textAlign="center" fontSize="lg" bold>
        Condominium
      </Text>
      {sections[4]?.map(Field)}

      <Button
        m="1"
        onPress={async () => {
          type ResultItem = Awaited<ReturnType<ReturnType<typeof uploadImage>>>
          const resImages = await images.reduce(
            (acc, cur) =>
              acc.then(p =>
                dispatch(uploadImage(cur.uri))
                  .then(v => v)
                  .catch(e => (console.log('e', e), e))
                  .then(v => [...p, v]),
              ),
            Promise.resolve<ResultItem[]>([]),
          )
          console.log('resImages', resImages)
          const eiImages = pipe(E.sequenceArray(resImages), E.map(RA.toArray))
          const eiAddress = fromStruct({
            cep: CEP.FromString,
            cityId: pipe(NumberFromString, compose(CityId.FromNumber)),
            complement: id<string>(),
            neighborhood: NonEmptyString.FromString,
            number: id<string>(),
            street: NonEmptyString.FromString,
          }).decode({
            cep,
            cityId,
            complement,
            neighborhood,
            number,
            street,
          })
          if (isLeft(eiImages)) {
            throw eiImages.left
          } else if (isLeft(eiAddress)) {
            console.log('address errors', draw(eiAddress.left))
            return
          } else {
            const res = await createRealEstate({
              status: status,
              fields: [
                ...choices.map(o => ({ id: o.field, optionId: o.option })),
                ...values.map(o => ({ id: o.field, value: o.value })),
              ],
              images: eiImages.right,
              address: eiAddress.right,
            })
            console.log('res', res)
          }
        }}
      >
        Save
      </Button>
    </ScrollView>
  )
}
