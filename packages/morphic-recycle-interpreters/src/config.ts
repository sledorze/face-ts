import { getApplyConfig } from '@morphic-ts/common/lib/config'
import { RecycleURI } from './hkt'
export * from './model' // to thread type level augmentations
export { RecycleURI }
/**
 * @since 0.0.1
 */
export const recycleApplyConfig = getApplyConfig(RecycleURI)
