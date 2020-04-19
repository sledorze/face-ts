import * as t from 'io-ts'
import { IOTSType, IoTsURI } from '../hkt'
import { ModelAlgebraRecursive2 } from '@morphic-ts/model-algebras/lib/recursive'

/**
 *  @since 0.0.1
 */
export const ioTsRecursiveInterpreter: ModelAlgebraRecursive2<IoTsURI> = {
  _F: IoTsURI,
  recursive: lazyA => env => new IOTSType(t.recursion(`recursive`, Self => lazyA(_ => new IOTSType(Self))(env).type))
}
