import { Ord, getMonoid } from 'fp-ts/lib/Ord'
import { ModelAlgebraIntersection1 } from '@morphic-ts/model-algebras/lib/intersections'
import { OrdType, OrdURI } from '../hkt'

const equalsOrd = <T>(): Ord<T> => ({
  equals: (_a: T, _b: T) => true,
  compare: (_a: T, _b: T) => 0
})

/**
 *  @since 0.0.1
 */
export const ordIntersectionInterpreter: ModelAlgebraIntersection1<OrdURI> = {
  _F: OrdURI,
  intersection: <A, R>(types: ((_: R) => OrdType<A>)[]) => (env: R) => {
    const { concat } = getMonoid<A>()
    const empty = equalsOrd<A>()
    return new OrdType<A>(types.map(t => t(env).ord).reduce(concat, empty))
  }
}
