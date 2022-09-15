import { Flex, Link } from 'native-base'
import { privacyPolicyUrl, termsOfServiceUrl } from 'src/constants'
import { t } from 'src/i18n'

export const Links = () => {
  return (
    <Flex direction="row" justify="space-evenly">
      <Link href={privacyPolicyUrl}>{t('privacy_policy')}</Link>
      <Link href={termsOfServiceUrl}>{t('terms_of_service')}</Link>
    </Flex>
  )
}
