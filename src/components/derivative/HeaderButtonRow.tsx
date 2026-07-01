import { Row } from './Row'

export const HeaderButtonRow = (props: { children: React.ReactNode }) => (
  <Row px={8} gap={8}>
    {props.children}
  </Row>
)
