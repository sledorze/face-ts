/**
 *  @since 0.0.1
 */
export const assignFunction = <F extends Function, C>(ab: F, c: C): F & C => {
  // tslint:disable-next-line: no-unnecessary-callback-wrapper
  const newF: typeof ab = ((...x: any[]) => ab(...x)) as any // force the creation of a new function to prevent mutation on the original
  return Object.assign(newF, c)
}

/**
 *  @since 0.0.1
 */
export type SelectKeyOfMatchingValues<KeyedValues, Constraint> = {
  [k in keyof KeyedValues]: KeyedValues[k] extends Constraint ? k : never
}[keyof KeyedValues]

/**
 *  @since 0.0.1
 */
export const assignCallable = <C, F extends Function & C, D>(F: F, d: D): F & C & D =>
  assignFunction(F, Object.assign({}, F, d))

/**
 *  @since 0.0.1
 */
// tslint:disable-next-line: no-unnecessary-callback-wrapper
export const wrapFun = <A, B, X>(g: ((a: A) => B) & X): typeof g => ((x: any) => g(x)) as any // force the creation of a new function to prevent mutation on the original

/**
 *  @since 0.0.1
 */
export interface InhabitedTypes<E, A> {
  // tslint:disable-next-line: no-unused-expression
  _E: E
  // tslint:disable-next-line: no-unused-expression
  _A: A
}
/**
 *  @since 0.0.1
 */
export type AType<X extends InhabitedTypes<any, any>> = X['_A']
/**
 *  @since 0.0.1
 */
export type EType<X extends InhabitedTypes<any, any>> = X['_E']

/**
 * Fake inhabitation of types
 */
/**
 *  @since 0.0.1
 */
export const inhabitTypes = <E, A, T>(t: T): T & InhabitedTypes<E, A> => t as T & InhabitedTypes<E, A>
