import { monoidAll } from 'fp-ts/lib/Monoid'
import { pipe } from 'fp-ts/lib/pipeable'
import type { ReadonlyRecord } from 'fp-ts/lib/ReadonlyRecord'
import { tuple } from 'fp-ts/lib/function'
import { flatten, zip, foldMap } from 'fp-ts/lib/Array'
import type { Right, Left, Either } from 'fp-ts/lib/Either'
import { right, left } from 'fp-ts/lib/Either'
import { some } from 'fp-ts/lib/Option'
import type { Option } from 'fp-ts/lib/Option'

/**
 *  @since 0.0.1
 */
export interface Recycle<A> {
  recycle: (prev: A, next: A) => A
}

const recycleAnyToNext: Recycle<any> = {
  recycle: (_prev: any, next: any) => next
}

export const fromRecycle = <A>(recycle: (prev: A, next: A) => A): Recycle<A> => ({
  recycle: (prev, next) => (prev === next ? prev : recycle(prev, next))
})

/**
 *  @since 0.0.1
 * recyclePrimitive always returns the next version as there's no reference for primitives
 */
export const recyclePrimitive = <A>(): Recycle<A> => recycleAnyToNext

/**
 *  @since 0.0.1
 */
export const recycleBoolean = recyclePrimitive<boolean>()
/**
 *  @since 0.0.1
 */
export const recycleString = recyclePrimitive<string>()
/**
 *  @since 0.0.1
 */
export const recycleNumber = recyclePrimitive<number>()
/**
 *  @since 0.0.1
 */
export const recycleBigint = recyclePrimitive<bigint>()

/**
 *  @since 0.0.1
 */
export const contramap = <A, B>(recycle: Recycle<A>, f: (b: B) => A): Recycle<B> =>
  fromRecycle((prev, next) => {
    const fPrev = f(prev)
    return recycle.recycle(fPrev, f(next)) === fPrev ? prev : next
  })

/**
 *  @since 0.0.1
 */
export const getOption = <A>(recycle: Recycle<A>): Recycle<Option<A>> =>
  fromRecycle((prev, next) => {
    if (prev._tag === 'Some' && next._tag === 'Some') {
      const r = recycle.recycle(prev.value, next.value)
      return r === prev.value ? prev : next.value === r ? next : some(r)
    } else {
      return next
    }
  })

/**
 *  @since 0.0.1
 */
// TODO: needs to share as much as possible..
// TODO: getArrayByKey is a Config optim
export const getArray = <A>(recycle: Recycle<A>): Recycle<A[]> =>
  fromRecycle((prev, next) =>
    prev.length !== next.length
      ? next
      : // TODO: Optimize
      pipe(
          zip(prev, next),
          foldMap(monoidAll)(([p, n]) => recycle.recycle(p, n) === p)
        )
      ? prev
      : next
  )

/**
 * version discarding all collisions (including the initial collided value)
 */
// const mapArrayToIndexedRecord = <A>(getKey: (a: A) => string) => (arr: A[]): Record<string, A> => {
//   // holds null if collision
//   const res: Record<string, A | null> = {}
//   for (const a of arr) {
//     const k = getKey(a)
//     const v = res[k]
//     // collision
//     if (v !== undefined) {
//       if (v !== null) {
//         res[k] = null
//       }
//     } else {
//       res[k] = a
//     }
//   }
//   return removeNullEntries(res)
// }

const mapArrayToIndexedRecord = <A>(getKey: (a: A) => string) => (arr: A[]): Record<string, A> => {
  const res: Record<string, A> = {}
  const l = arr.length
  for (let i = 0; i < l; i++) {
    const a = arr[i]
    res[getKey(a)] = a
  }
  return res
}

/**
 *
 */
export const getArrayByKey = <A>(getKey: (a: A) => string) => (recycle: Recycle<A>): Recycle<A[]> =>
  fromRecycle((prev, next) => {
    const res = new Array(next.length)
    let recyclable = true
    let isNext = true

    const uniq = mapArrayToIndexedRecord(getKey)(prev)
    const l = next.length
    for (let index = 0; index < l; index++) {
      const n = next[index]
      const p = uniq[getKey(n)] as A | undefined
      if (p !== undefined) {
        const r = recycle.recycle(p, n)
        res[index] = r
        if (r !== p) {
          recyclable = false
        }
        if (r !== n) {
          isNext = false
        }
      } else {
        res[index] = n
        recyclable = false
      }
    }
    return recyclable ? prev : isNext ? next : res
  })

/**
 *  @since 0.0.1
 */
export const getEither = <A, E>(recycleE: Recycle<E>, recycleA: Recycle<A>): Recycle<Either<E, A>> =>
  fromRecycle((prev, next) => {
    if (prev._tag === next._tag) {
      if (prev._tag === 'Right') {
        const pr = prev.right
        const nr = (next as Right<A>).right
        const r = recycleA.recycle(pr, nr)
        return pr === r ? prev : nr === r ? next : right(r)
      } else {
        const pl = prev.left
        const nl = (next as Left<E>).left
        const l = recycleE.recycle(pl, nl)
        return pl === l ? prev : nl === l ? next : left(l)
      }
    } else {
      return next
    }
  })

/**
 *  @since 0.0.1
 */
export const getStruct = <O extends ReadonlyRecord<string, any>>(
  recycles: {
    [K in keyof O]: Recycle<O[K]>
  }
): Recycle<O> => {
  const recyclesArr = Object.keys(recycles).map((k: keyof O) => tuple(k, recycles[k].recycle))
  return fromRecycle((prev, next) => {
    const res: O = {} as O
    let recyclable = true
    let isNext = true
    for (const [k, recycle] of recyclesArr) {
      const p = prev[k]
      const n = next[k]
      const r = recycle(p, n)
      res[k] = r
      if (r !== p) {
        recyclable = false
      }
      if (r !== n) {
        isNext = false
      }
    }
    return recyclable ? prev : isNext ? next : res
  })
}

/**
 *  @since 0.0.1
 */
export const getPartialStruct = <O extends ReadonlyRecord<string, any>>(
  recycles: {
    [K in keyof O]: Recycle<O[K]>
  }
): Recycle<O> => {
  const recyclesArr = Object.keys(recycles).map((k: keyof O) => tuple(k, recycles[k].recycle))
  return fromRecycle((prev, next) => {
    const res: O = {} as O
    let recyclable = true
    let isNext = true
    for (const [k, recycle] of recyclesArr) {
      if (k in next) {
        const p = prev[k]
        const n = next[k]
        const r = recycle(p, n)
        res[k] = r
        if (r !== p) {
          recyclable = false
        }
        if (r !== n) {
          isNext = false
        }
      } else {
        if (k in prev) {
          recyclable = false
        }
      }
    }
    return recyclable ? prev : isNext ? next : res
  })
}

/**
 *  @since 0.0.1
 */
export const getSet = <A>(_recycle: Recycle<A>): Recycle<Set<A>> =>
  fromRecycle(
    (_prev, next) => next // TODO: revise strategy
  )

const removeNullEntries = <T>(r: Record<string, T | null>): Record<string, NonNullable<T>> => {
  for (const k in r) {
    if (r.hasOwnProperty(k)) {
      if (r[k] === null) {
        delete r[k]
      }
    }
  }
  return r as Record<string, NonNullable<T>>
}

const assumeNotNull = <T>(r: Record<string, T | null>): Record<string, NonNullable<T>> =>
  r as Record<string, NonNullable<T>>

export const setToRecord = <A>(f: (a: A) => string) => (
  s: Set<A>
): { uniq: Record<string, A>; colliding: Record<string, A[]> } => {
  const uniq: Record<string, A | null> = {}
  const colliding: Record<string, A[]> = {}
  let mustFilterNull = false
  for (const v of s.values()) {
    const k = f(v)
    if (k in uniq) {
      const ov = uniq[k]
      if (ov === null) {
        colliding[k].push(v)
      } else {
        colliding[k] = [ov, v]
        uniq[k] = null
        mustFilterNull = true
      }
    } else {
      uniq[k] = v // General case
    }
  }

  return { uniq: mustFilterNull ? removeNullEntries(uniq) : assumeNotNull(uniq), colliding }
}
const recordToSet = <A>(r: Record<string, A>, coll: Record<string, A[]>): Set<A> =>
  new Set([...Object.values(r), ...flatten(Object.values(coll))])

const isEmpty = (x: Record<string, any>) => Object.keys(x).length === 0

/**
 *  @since 0.0.1
 */
export const getStrMap = <A>({ recycle }: Recycle<A>): Recycle<Record<string, A>> =>
  fromRecycle((prev, next) => {
    const nextKeys = Object.keys(next)
    const res: Record<string, A> = {}
    let recyclable = true
    let isNext = true
    for (const k of nextKeys) {
      if (next.hasOwnProperty(k)) {
        const p = prev[k] as A | undefined
        const n = next[k]
        const r = p === undefined ? n : recycle(p, n)
        res[k] = r
        if (r !== p) {
          recyclable = false
        }
        if (r !== n) {
          isNext = false
        }
      }
    }
    return recyclable && Object.keys(prev).length === nextKeys.length ? prev : isNext ? next : res
  })

/**
 *  @since 0.0.1
 */
export const getSetByKey = <A>(getKey: (a: A) => string) => (recycle: Recycle<A>): Recycle<Set<A>> => {
  const toRecord = setToRecord(getKey)
  return fromRecycle((prevS, nextS) => {
    const { uniq: prev, colliding: prevColl } = toRecord(prevS)
    const { uniq: next, colliding: nextColl } = toRecord(nextS)
    const res = getStrMap(recycle).recycle(prev, next)
    return res === prev && isEmpty(prevColl) && isEmpty(nextColl)
      ? prevS
      : res === next && isEmpty(nextColl)
      ? nextS
      : isEmpty(next)
      ? nextS
      : recordToSet(res, nextColl)
  })
}
