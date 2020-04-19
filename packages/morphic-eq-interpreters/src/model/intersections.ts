import { ModelAlgebraIntersection1 } from '@morphic-ts/model-algebras/lib/intersections'
import { monoidAll, fold } from 'fp-ts/lib/Monoid'
import { EqType, EqURI } from '../hkt'

/**
 *  @since 0.0.1
 */
export const eqIntersectionInterpreter: ModelAlgebraIntersection1<EqURI> = {
  _F: EqURI,
  intersection: <A, R>(types: ((env: R) => EqType<A>)[]) => (env: R) => {
    const equals = types.map(getEq => getEq(env).eq.equals)
    return new EqType<A>({
      equals: (a: A, b: A) => fold(monoidAll)(equals.map(eq => eq(a, b))) // TODO: optimize
    })
  }
}
