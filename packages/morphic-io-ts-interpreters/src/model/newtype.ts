import { ModelAlgebraNewtype2 } from '@morphic-ts/model-algebras/lib/newtype'
import { IOTSType, IoTsURI } from '../hkt'
import { applyCustomize } from './common'

/**
 *  @since 0.0.1
 */
export const ioTsNewtypeInterpreter: ModelAlgebraNewtype2<IoTsURI> = {
  _F: IoTsURI,
  newtype: () => a => env => new IOTSType(a(env).type),
  newtypeCfg: () => a => config => env => new IOTSType(applyCustomize(config)(a(env).type, env))
}
