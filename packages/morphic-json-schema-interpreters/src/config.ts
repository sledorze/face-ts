import { getApplyConfig } from '@morphic-ts/common/lib/config'
import { JsonSchemaURI } from './hkt'
export * from './model'
export { JsonSchemaURI }
/**
 *  @since 0.0.1
 */
export const jsonSchemaApplyConfig = getApplyConfig(JsonSchemaURI)
