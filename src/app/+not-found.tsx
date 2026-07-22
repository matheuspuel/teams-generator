import { useFocusEffect, useRouter } from 'expo-router'

export default function NotFound() {
  const router = useRouter()

  useFocusEffect(() => {
    router.dismissTo('/')
  })

  return null
}
