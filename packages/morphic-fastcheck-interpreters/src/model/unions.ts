import { FastCheckType, FastCheckURI } from '../hkt'
import { ModelAlgebraUnions1 } from '@morphic-ts/model-algebras/lib/unions'
import { oneof } from 'fast-check'

/**
 *  @since 0.0.1
 */
export const fastCheckUnionInterpreter: ModelAlgebraUnions1<FastCheckURI> = {
  _F: FastCheckURI,
  union: <A, R>(items: ((env: R) => FastCheckType<A>)[]) => (env: R) =>
    new FastCheckType(oneof(...items.map(v => v(env).arb)))
}
