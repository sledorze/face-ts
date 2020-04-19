import { set } from 'fast-check'
import { FastCheckType, FastCheckURI } from '../hkt'
import { fromArray } from 'fp-ts/lib/Set'
import { ModelAlgebraSet1 } from '@morphic-ts/model-algebras/lib/set'

/**
 *  @since 0.0.1
 */
export const fastCheckSetInterpreter: ModelAlgebraSet1<FastCheckURI> = {
  _F: FastCheckURI,
  set: (a, ord) => env => new FastCheckType(set(a(env).arb).map(fromArray(ord)))
}
