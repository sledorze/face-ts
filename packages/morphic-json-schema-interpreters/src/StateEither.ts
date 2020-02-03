import * as E from 'fp-ts/lib/Either'
import { Either } from 'fp-ts/lib/Either'
import { Monad3 } from 'fp-ts/lib/Monad'
import { MonadThrow3 } from 'fp-ts/lib/MonadThrow'
import { State } from 'fp-ts/lib/State'
import { getStateM } from 'fp-ts/lib/StateT'
import { pipeable } from 'fp-ts/lib/pipeable'

const T = getStateM(E.either)

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    StateEither: StateEither<R, E, A>
  }
}

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const URI = 'StateEither'

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export type URI = typeof URI

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export interface StateEither<S, E, A> {
  (s: S): Either<E, [A, S]>
}

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export function run<S, E, A>(ma: StateEither<S, E, A>, s: S): Either<E, [A, S]> {
  return ma(s)
}

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const evalState: <S, E, A>(ma: StateEither<S, E, A>, s: S) => Either<E, A> = T.evalState

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const execState: <S, E, A>(ma: StateEither<S, E, A>, s: S) => Either<E, S> = T.execState

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export function left<S, E>(e: E): StateEither<S, E, never> {
  return StateEither(E.left(e))
}

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const right: <S, A>(a: A) => StateEither<S, never, A> = T.of

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const StateEither: <S, E, A>(ma: Either<E, A>) => StateEither<S, E, A> = T.fromM

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const rightState: <S, A>(ma: State<S, A>) => StateEither<S, never, A> = T.fromState

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export function leftState<S, E>(me: State<S, E>): StateEither<S, E, never> {
  return s => E.left(me(s)[0])
}

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const get: <S>() => StateEither<S, never, S> = T.get

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const put: <S>(s: S) => StateEither<S, never, void> = T.put

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const modify: <S>(f: (s: S) => S) => StateEither<S, never, void> = T.modify

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const gets: <S, A>(f: (s: S) => A) => StateEither<S, never, A> = T.gets

/**
 * @since 0.1.10
 */
/**
 *  @since 0.0.1
 */
export function fromEitherK<E, A extends Array<unknown>, B>(
  f: (...a: A) => Either<E, B>
): <S>(...a: A) => StateEither<S, E, B> {
  return (...a) => fromEither(f(...a))
}

/**
 * @since 0.1.10
 */
/**
 *  @since 0.0.1
 */
export function chainEitherK<E, A, B>(
  f: (a: A) => Either<E, B>
): <S>(ma: StateEither<S, E, A>) => StateEither<S, E, B> {
  return chain<any, E, A, B>(fromEitherK(f))
}

/**
 * @since 0.1.10
 */
/**
 *  @since 0.0.1
 */
export function StateEitherK<E, A extends Array<unknown>, B>(
  f: (...a: A) => Either<E, B>
): <S>(...a: A) => StateEither<S, E, B> {
  return (...a) => StateEither(f(...a))
}

/**
 * @since 0.1.10
 */
/**
 *  @since 0.0.1
 */
export function StatekEitherK<E, A, B>(
  f: (a: A) => Either<E, B>
): <S>(ma: StateEither<S, E, A>) => StateEither<S, E, B> {
  return chain<any, E, A, B>(StateEitherK(f))
}

/**
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const stateEither: Monad3<URI> & MonadThrow3<URI> = {
  URI,
  map: T.map,
  of: right,
  ap: T.ap,
  chain: T.chain,
  throwError: left
}

/**
 * Like `stateEither` but `ap` is sequential
 * @since 0.1.0
 */
/**
 *  @since 0.0.1
 */
export const stateEitherSeq: typeof stateEither = {
  ...stateEither,
  ap: (mab, ma) => T.chain(mab, f => T.map(ma, f))
}

const {
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
  filterOrElse,
  fromEither,
  fromOption,
  fromPredicate
} = pipeable(stateEither)

/**
 *  @since 0.0.1
 */
export {
  /**
   * @since 0.1.0
   */
  ap,
  /**
   * @since 0.1.0
   */
  apFirst,
  /**
   * @since 0.1.0
   */
  apSecond,
  /**
   * @since 0.1.0
   */
  chain,
  /**
   * @since 0.1.0
   */
  chainFirst,
  /**
   * @since 0.1.0
   */
  flatten,
  /**
   * @since 0.1.0
   */
  map,
  /**
   * @since 0.1.0
   */
  filterOrElse,
  /**
   * @since 0.1.0
   */
  fromEither,
  /**
   * @since 0.1.0
   */
  fromOption,
  /**
   * @since 0.1.0
   */
  fromPredicate
}