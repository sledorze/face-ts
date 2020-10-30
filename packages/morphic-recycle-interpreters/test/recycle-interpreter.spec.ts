import * as chai from 'chai'

import { Materialized } from '@morphic-ts/batteries/lib/usage/materializer'
import { makeSummoner, Summoners, AnyConfigEnv, ExtractEnv } from '@morphic-ts/batteries/lib/usage/summoner'
import { cacheUnaryFunction } from '@morphic-ts/common/lib/core'

import { ProgramNoUnionURI } from '@morphic-ts/batteries/lib/program-no-union'
import { modelRecycleInterpreter } from '../src/interpreters'
import { ProgramType } from '@morphic-ts/batteries/lib/usage/ProgramType'
import { Newtype, iso } from 'newtype-ts'
import { RecycleURI } from '../src/index'
import { left, right, Either, isRight, isLeft } from 'fp-ts/lib/Either'
import { Recycle, fromRecycle, setToRecord, getSetByKey, getStrMap, getArrayByKey } from '../src/recycle'
import { AType } from '@morphic-ts/batteries/lib/usage/utils'

export const RecycleInterpreterURI = 'RecycleInterpreterURI' as const
export type RecycleInterpreterURI = typeof RecycleInterpreterURI

import { modelFastCheckInterpreter } from '@morphic-ts/fastcheck-interpreters'
import { Branded } from 'io-ts'
import { ordString, ordNumber, getTupleOrd, contramap } from 'fp-ts/lib/Ord'
import { tuple } from 'fp-ts/lib/function'
import * as fc from 'fast-check'
import { some, none } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import type { Option } from 'fp-ts/lib/Option'

const clone = <A extends object>(a: A) => ({ ...a })

interface RecycleInterpreter<A> {
  build: (a: A) => A
  recycle: Recycle<A>
}

declare module '@morphic-ts/batteries/lib/usage/InterpreterResult' {
  interface InterpreterResult<E, A> {
    [RecycleInterpreterURI]: RecycleInterpreter<A>
  }
}

/** Type level override to keep Morph type name short */
export interface M<R, L, A> extends Materialized<R, L, A, ProgramNoUnionURI, RecycleInterpreterURI> {}
export interface UM<R, A> extends Materialized<R, {}, A, ProgramNoUnionURI, RecycleInterpreterURI> {}

interface Summoner<R> extends Summoners<ProgramNoUnionURI, RecycleInterpreterURI, R> {
  <L, A>(F: ProgramType<R, L, A>[ProgramNoUnionURI]): M<R, L, A>
}

export const summonFor = <R extends AnyConfigEnv = {}>(env: ExtractEnv<R, RecycleURI>) =>
  makeSummoner<Summoner<R>>(cacheUnaryFunction, program => ({
    build: a => a,
    recycle: program(modelRecycleInterpreter<NonNullable<R>>())(env).recycle
  }))

const { summon } = summonFor<{}>({})

const mustRecycle = <A>({ recycle }: Recycle<A>) => (a: A, b: A) => chai.assert.strictEqual(recycle(a, b), a)
const mustNotRecycle = <A>({ recycle }: Recycle<A>) => (a: A, b: A) => chai.assert.strictEqual(recycle(a, b), b)

const makeRecycler = <A>(recycle: Recycle<A>) => ({
  recycle,
  mustRecycle: mustRecycle(recycle),
  mustNotRecycle: mustNotRecycle(recycle)
})

describe('Recycle', () => {
  it('bigInt', () => {
    const { recycle } = summon(F => F.bigint())
    const a = BigInt(10)
    const aBis = BigInt(10)
    const b = BigInt(11)
    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)
    mustRecycle(a, aBis)
    mustNotRecycle(a, b)
  })

  it('newtype', () => {
    interface Test extends Newtype<{ readonly Test: unique symbol }, string> {}
    const isoTest = iso<Test>()

    const { recycle } = summon(F => F.newtype<Test>('Test')(F.string()))

    const testA = isoTest.wrap('a')
    const testABis = isoTest.wrap('a')
    const testB = isoTest.wrap('b')

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle(testA, testABis)
    mustNotRecycle(testA, testB)
  })

  it('unknown', () => {
    const { recycle } = summon(F => F.unknown())
    const a = { x: 12 }
    const abis = { x: 12 }
    const b = { y: '12' }

    const { mustNotRecycle } = makeRecycler(recycle)

    mustNotRecycle(a, b)
    // TODO: this is the default; we may add a generic unknown based compare thing..
    mustNotRecycle(a, abis)
  })

  it('recursive compare of circular unknown', () => {
    const { recycle } = summon(F => F.unknown({ RecycleURI: recycle => recycle }))

    const recDataA = {
      a: 'a',
      b: null as any
    }
    recDataA.b = recDataA

    const recDataABis = {
      a: 'a',
      b: null as any
    }
    recDataABis.b = recDataABis

    const recDataB = {
      a: 'b',
      b: null as any
    }
    recDataB.b = recDataB

    const { mustNotRecycle } = makeRecycler(recycle)

    // TODO: this is the default; we may add a generic unknown based compare thing..
    mustNotRecycle(recDataA, recDataABis)
    mustNotRecycle(recDataA, recDataB)
  })

  it('recursive compare of non-circular unknown', () => {
    let calls = 0

    const recycleF = fromRecycle((_prev, next) => {
      calls += 1
      return next
    })

    const { recycle } = summon(F => F.unknown({ RecycleURI: _ => recycleF }))

    const recDataA = {
      a: 'a',
      b: null as any
    }
    recDataA.b = recDataA

    const recDataB = {
      a: 'b',
      b: null as any
    }
    recDataB.b = recDataB

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle(recDataA, recDataA)
    mustNotRecycle(recDataA, recDataB)
    mustNotRecycle(recDataB, recDataA)
    chai.assert.strictEqual(calls, 2) // 2 because recycle should do a reference comparison automatically
  })

  it('returns next when comparing incomplete values', () => {
    const Foo = summon(F =>
      F.interface(
        {
          date: F.date(),
          a: F.string()
        },
        'Foo'
      )
    )

    const { recycle } = Foo

    const date = new Date(12345)

    const { mustNotRecycle } = makeRecycler(recycle)
    mustNotRecycle({ date, a: '' }, { date } as any)
  })

  it('recycle', () => {
    const Foo = summon(F =>
      F.interface(
        {
          date: F.date(),
          a: F.string()
        },
        'Foo'
      )
    )

    const { recycle } = Foo

    const date = new Date(12345)
    const date2 = new Date(12346)
    const a = { date, a: '' }
    const aBis = { date, a: '' }
    const b = { date: date2, a: '' }

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle(a, aBis)
    mustNotRecycle(a, b)
  })

  it('recycle', () => {
    const Foo = summon(F =>
      F.interface(
        {
          dates: F.array(
            F.interface(
              {
                date: F.date()
              },
              'HasDate'
            )
          ),
          a: F.string()
        },
        'Foo'
      )
    )

    const { recycle } = Foo

    const date = new Date(12345)
    const date2 = new Date(12346)

    const a = { dates: [{ date }, { date }], a: '' }
    const aBis = { dates: [{ date }, { date }], a: '' }
    const b = { dates: [{ date }, { date: date2 }], a: '' }

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle(a, aBis)
    mustNotRecycle(a, b)
  })

  it('interface', () => {
    interface Foo {
      a: Option<string>
      b: Option<number>
    }
    const Foo = summon(F =>
      F.interface(
        {
          a: F.nullable(F.string()),
          b: F.nullable(F.number())
        },
        'Foo'
      )
    )

    const { recycle } = Foo

    const a = some('a')
    const aBis = some('a')
    const b = some('b')
    const one = some(1)
    const two = some(2)

    const fooA1 = Foo.build({ a, b: one })
    const fooA1Bis = Foo.build({ a: aBis, b: one })

    // recycle member from previous, all values structurally equals
    const r1 = recycle.recycle(fooA1, fooA1Bis)
    chai.assert.notStrictEqual(r1, fooA1Bis)
    chai.assert.strictEqual(r1.a, a)
    chai.assert.strictEqual(r1.b, one)

    const fooA2 = Foo.build({ a: aBis, b: two })
    // recycle member from previous, all values not structurally equals
    const r2 = recycle.recycle(fooA1, fooA2)
    chai.assert.notStrictEqual(r2, fooA2)
    chai.assert.strictEqual(r2.a, a)
    chai.assert.strictEqual(r2.b, two)

    // Nominal case (different)
    const fooB = Foo.build({ a: b, b: one })
    const r3 = recycle.recycle(fooA2, fooB)
    chai.assert.strictEqual(r3, fooB)
  })

  it('partial', () => {
    interface Foo {
      type: 'foo'
      a: string
      b: number
    }
    const Foo = summon(F =>
      F.partial(
        {
          type: F.stringLiteral('foo'),
          a: F.string(),
          b: F.number()
        },
        'Foo'
      )
    )

    const { recycle } = Foo

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle({}, {})
    mustRecycle({ type: 'foo' }, { type: 'foo' })
    mustNotRecycle({ type: 'foo' }, { type: 'foo', a: 'foo' })
    mustNotRecycle({ type: 'foo', a: 'foo' }, { type: 'foo' })
    mustNotRecycle({ type: 'foo' }, { a: 'foo' })
    mustNotRecycle({}, { type: 'foo' })
    mustNotRecycle({ type: 'foo' }, {})
  })

  it('partial deep', () => {
    interface Foo {
      a: Option<string>
      b: Option<number>
    }
    const Foo = summon(F =>
      F.partial(
        {
          a: F.nullable(F.string()),
          b: F.nullable(F.number()),
          c: F.string()
        },
        'Foo'
      )
    )

    const { recycle } = Foo

    const a = some('a')
    const aBis = some('a')
    const b = some('b')
    const one = some(1)
    const two = some(2)

    const fooA1 = Foo.build({ a, b: one, c: 'c' })
    const fooA1Bis = Foo.build({ a: aBis, b: one, c: 'c' })

    // recycle member from previous, all values structurally equals
    const r1 = recycle.recycle(fooA1, fooA1Bis)
    chai.assert.notStrictEqual(r1, fooA1Bis)
    chai.assert.strictEqual(r1.a, a)
    chai.assert.strictEqual(r1.b, one)
    chai.assert.strictEqual(r1.c, 'c')

    const fooA2 = Foo.build({ a: aBis, b: two })
    // recycle member from previous, all values not structurally equals AND optional prop
    const r2 = recycle.recycle(fooA1, fooA2)
    chai.assert.notStrictEqual(r2, fooA2)
    chai.assert.strictEqual(r2.a, a)
    chai.assert.strictEqual(r2.b, two)
    chai.assert.notProperty(r2, 'c')

    // Nominal case (different)
    const fooB = Foo.build({ a: b, b: one })
    const r3 = recycle.recycle(fooA2, fooB)
    chai.assert.strictEqual(r3, fooB)
  })

  it('taggedUnion', () => {
    interface Foo {
      type: 'foo'
      a: string
      b: number
    }
    const Foo = summon<unknown, Foo>(F =>
      F.interface(
        {
          type: F.stringLiteral('foo'),
          a: F.string(),
          b: F.number()
        },
        'Foo'
      )
    )

    interface Bar {
      type: 'bar'
      c: string
      d: number
    }
    const Bar = summon<unknown, Bar>(F =>
      F.interface(
        {
          type: F.stringLiteral('bar'),
          c: F.string(),
          d: F.number()
        },
        'Bar'
      )
    )

    const FooBar = summon(F =>
      F.taggedUnion(
        'type',
        {
          foo: Foo(F),
          bar: Bar(F)
        },
        'FooBar'
      )
    )

    const recycle = FooBar.recycle

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    const fooA: Foo | Bar = { type: 'foo', a: 'a', b: 12 }
    const fooABis: Foo | Bar = { type: 'foo', a: 'a', b: 12 }
    const fooB: Foo | Bar = { type: 'foo', a: 'b', b: 12 }

    const barA: Foo | Bar = { type: 'bar', c: 'a', d: 12 }
    const barB: Foo | Bar = { type: 'bar', c: 'b', d: 12 }

    mustRecycle(fooA, fooA)
    mustRecycle(fooA, fooABis)
    mustNotRecycle(fooA, fooB)
    mustNotRecycle(fooA, barA)
    mustNotRecycle(barA, barB)
  })

  it('either', () => {
    const { recycle } = summon(F => F.either(F.string(), F.number()))
    const la: Either<string, number> = left('a')
    const labis: Either<string, number> = left('a')
    const r1: Either<string, number> = right(1)
    const lb: Either<string, number> = left('b')
    const r2: Either<string, number> = right(2)
    const r2bis: Either<string, number> = right(2)

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle(la, la)
    mustRecycle(la, labis)
    mustRecycle(r1, r1)
    mustRecycle(r2, r2bis)

    mustNotRecycle(la, lb)
    mustNotRecycle(la, r1)
    mustNotRecycle(r2, r1)
  })

  it('either deep', () => {
    const Inner = summon(F => F.interface({ a: F.interface({ c: F.string() }, 'C'), b: F.number() }, 'AB'))

    const { build, recycle } = summon(F => F.either(Inner(F), Inner(F)))

    const laC = { c: 'c' }
    const la1 = build(left({ a: laC, b: 1 }))
    const la2 = build(left({ a: laC, b: 2 }))
    const la3 = build(left({ a: { c: 'c' }, b: 1 }))
    const la4 = build(left({ a: { c: 'c' }, b: 2 }))

    const ra1 = build(right({ a: laC, b: 1 }))
    const ra2 = build(right({ a: laC, b: 2 }))
    const ra3 = build(right({ a: { c: 'c' }, b: 1 }))

    const resL = recycle.recycle(la1, la2)
    if (isLeft(resL)) {
      chai.assert.strictEqual(resL, la2)
    }

    const resL2 = recycle.recycle(la1, la3)
    if (isLeft(resL2)) {
      chai.assert.strictEqual(resL2, la1)
    }

    const resL3 = recycle.recycle(la1, la4)
    if (isLeft(resL3)) {
      chai.assert.notStrictEqual(resL3, la1)
      chai.assert.notStrictEqual(resL3, la4)
      chai.assert.strictEqual(resL3.left.a, laC)
    }

    const resR = recycle.recycle(ra1, ra2)
    if (isRight(resR)) {
      chai.assert.notStrictEqual(resR, ra1)
      chai.assert.strictEqual(resR, ra2)
      chai.assert.strictEqual(resR.right.a, laC)
    }

    const resR2 = recycle.recycle(ra1, ra2)
    if (isRight(resR2)) {
      chai.assert.notStrictEqual(resR2, ra1)
      chai.assert.notStrictEqual(resR2, ra3)
      chai.assert.strictEqual(resR2.right.a, laC)
    }
  })

  it('option', () => {
    const { recycle } = summon(F => F.option(F.string()))
    const a1 = some('a')
    const a2 = some('a')
    const b = some('b')
    const n = none

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    mustRecycle(a1, a1)
    mustRecycle(a1, a2)
    mustRecycle(n, n)

    mustNotRecycle(a1, b)
    mustNotRecycle(a1, n)
  })

  it('intersection', () => {
    const { recycle, build } = summon(F =>
      F.intersection(
        [
          F.interface(
            {
              a: F.nullable(F.string()),
              a2: F.nullable(F.string())
            },
            'A'
          ),
          F.interface(
            {
              b: F.nullable(F.string())
            },
            'B'
          )
        ],
        'AB'
      )
    )

    const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

    const AaBb = build({ a: some('a'), a2: some('a'), b: some('b') })
    const AaBbBis = build({ a: some('a'), a2: some('a'), b: some('b') })
    mustRecycle(AaBb, AaBbBis)

    const AcBd = build({ a: some('c'), a2: some('x'), b: some('d') })
    mustNotRecycle(AaBb, AcBd)

    const AaBc = build({ a: some('a'), a2: some('b'), b: some('c') })
    const res = recycle.recycle(AaBb, AaBc)
    chai.assert.notStrictEqual(res, AaBc)
    chai.assert.strictEqual(res.a, AaBb.a)
    chai.assert.strictEqual(res.b, AaBc.b)
  })

  it('preserve structural equality', () => {
    interface Test extends Newtype<{ readonly Test: unique symbol }, string> {}

    interface NonEmptyBrand {
      readonly NonEmpty: unique symbol
    }

    const Obj = summon(F => F.interface({ a: F.string(), b: F.number() }, 'Obj'))
    const ordObj = pipe(
      getTupleOrd(ordString, ordNumber),
      contramap((x: { a: string; b: number }) => tuple(x.a, x.b))
    )

    const ObjA = summon(F => F.interface({ type: F.stringLiteral('ObjA'), x: F.string() }, 'ObjA'))
    const ObjB = summon(F => F.interface({ type: F.stringLiteral('ObjB'), y: F.string() }, 'ObjB'))
    const ObjC = summon(F => F.interface({ type: F.stringLiteral('ObjC'), z: F.string() }, 'ObjC'))

    const A = summon(F =>
      F.interface(
        {
          bigint: F.bigint(),
          boolean: F.boolean(),
          date: F.date(),
          either: F.either(F.string(), F.number()),
          keysOf: F.keysOf({ a: null, b: null }),
          newType: F.newtype<Test>('Test')(F.string()),
          nullable: F.nullable(F.string()),
          number: F.number(),
          option: F.option(F.string()),
          partial: F.partial({ a: F.string(), b: F.number() }, 'P'),
          refined: F.refined(F.string(), (x: string): x is Branded<string, NonEmptyBrand> => x.length > 0, 'NonEmpty'),
          set: F.set(Obj(F), ordObj),
          strMap: F.strMap(Obj(F)),
          array: F.array(Obj(F)),
          stringLiteral: F.stringLiteral('foo'),
          unknown: F.unknown(),
          uuid: F.uuid(),
          taggedUnion: F.taggedUnion(
            'type',
            {
              ObjA: ObjA(F),
              ObjB: ObjB(F),
              ObjC: ObjC(F)
            },
            'e'
          )
        },
        'A'
      )
    )
    const { arb } = A.derive(modelFastCheckInterpreter())({})

    fc.property(arb, arb, (x, y) => chai.assert.deepStrictEqual(A.recycle.recycle(x, y), y))
  })
})

describe('setToRecord', () => {
  const A = summon(F => F.interface({ a: F.string(), b: F.string() }, 'A'))
  type A = AType<typeof A>

  const Aa1 = A.build({ a: 'a', b: '1' })
  const Aa2 = A.build({ a: 'a', b: '2' })
  const Ab1 = A.build({ a: 'b', b: '1' })
  const Ab2 = A.build({ a: 'b', b: '2' })

  const toRecordByA = setToRecord<A>(_ => _.a)

  it('index by property', () => {
    const { uniq, colliding } = toRecordByA(new Set([Aa1, Ab2]))
    chai.assert.deepStrictEqual(uniq, { a: Aa1, b: Ab2 })
    chai.assert.deepStrictEqual(colliding, {})
  })

  it('report colliding keys separately', () => {
    const { uniq, colliding } = toRecordByA(new Set([Aa1, Aa2, Ab1, Ab2]))
    chai.assert.deepStrictEqual(uniq, {})
    chai.assert.deepStrictEqual(colliding, { a: [Aa1, Aa2], b: [Ab1, Ab2] })
  })

  it('index and report colliding keys', () => {
    const { uniq, colliding } = toRecordByA(new Set([Aa1, Aa2, Ab1]))
    chai.assert.deepStrictEqual(uniq, { b: Ab1 })
    chai.assert.deepStrictEqual(colliding, { a: [Aa1, Aa2] })
  })
})

describe('getSetByKey', () => {
  const A = summon(F => F.interface({ a: F.string(), b: F.nullable(F.string()) }, 'A'))
  type A = AType<typeof A>
  const Aa1 = A.build({ a: 'a', b: some('1') })
  const Aa2 = A.build({ a: 'a', b: some('2') })
  const Ab1 = A.build({ a: 'b', b: some('1') })
  const Ab2 = A.build({ a: 'b', b: some('2') })

  const getSetByA = getSetByKey<A>(_ => _.a)
  const recycle = getSetByA(A.recycle)
  const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

  it('returns previous if totally recycled', () => {
    const set1 = new Set([Aa1, Ab1])
    const set2 = new Set([clone(Aa1), clone(Ab1)])
    mustRecycle(set1, set2)
  })
  it('returns next if no recycling possible', () => {
    const set1 = new Set([Aa1, Ab1])
    const set2 = new Set([Aa2, Ab2])
    mustNotRecycle(set1, set2)
  })
  it('returns a mix with recycled parts if sharing is partial', () => {
    const set1 = new Set([Aa1, Ab1])
    const set2 = new Set([clone(Aa1), Ab2])
    const r = recycle.recycle(set1, set2)
    chai.assert.notStrictEqual(r, set1)
    chai.assert.notStrictEqual(r, set2)
    chai.assert.deepStrictEqual(r, set2)
    mustRecycle(r, new Set([Aa1, Ab2]))
  })
  it('returns next values of colliding ones', () => {
    const set1 = new Set([Aa1])
    const set2 = new Set([clone(Aa1), Aa2])
    const r = recycle.recycle(set1, set2)
    chai.assert.strictEqual(r, set2)
  })
  it('does not recycle colliding prev values', () => {
    const set1 = new Set([clone(Aa1), Aa2])
    const set2 = new Set([Aa1])
    const r = recycle.recycle(set1, set2)
    chai.assert.strictEqual(r, set2)
  })
  it('does return all next colliding values if recycling prev', () => {
    const set1 = new Set([Ab1])
    const set2 = new Set([Aa1, Aa2, clone(Ab1)])
    const r = recycle.recycle(set1, set2)

    const setToRecordByAB = setToRecord((_: A) => `${_.a}${_.b}`)

    chai.assert.deepStrictEqual(setToRecordByAB(r), setToRecordByAB(set2))
    chai.assert.equal(Array.from(r.values()).filter(x => x === Ab1).length, 1)
  })
})

describe('strMap', () => {
  const A = summon(F => F.interface({ b: F.nullable(F.string()) }, 'A'))
  type A = AType<typeof A>
  const A1 = A.build({ b: some('1') })
  const A2 = A.build({ b: some('2') })
  const A3 = A.build({ b: some('3') })
  const A4 = A.build({ b: some('4') })

  const recycle = getStrMap(A.recycle)
  const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

  it('should recycle shared keys', () => {
    mustRecycle({ a: A1, b: A2 }, { a: clone(A1), b: clone(A2) })
  })

  it('should not recycle if no shared keys', () => {
    mustNotRecycle({ a: A1, b: A2 }, { a: A3, b: A4 })
  })

  it('should paritally recycle', () => {
    const set1 = { a: A1, b: A2 }
    const set2 = { a: A1, b: clone(A2) }
    const r = recycle.recycle(set1, set2)
    chai.assert.deepStrictEqual(r, set2)
    chai.assert.strictEqual(r['b'], A2)
  })

  it('should not leak prev values', () => {
    const set1 = { a: A1, b: A2, c: A3 }
    const set2 = { a: A1, b: clone(A2) }
    chai.assert.deepStrictEqual(recycle.recycle(set1, set2), set2)
  })

  it('should not leak prev values (2)', () => {
    const set1 = { a: A1, b: A2, c: A3 }
    const set2 = { a: A1, b: A2 }
    chai.assert.deepStrictEqual(recycle.recycle(set1, set2), set2)
  })

  it('should not forgot next values', () => {
    const set1 = { a: A1, b: A2 }
    const set2 = { a: A1, b: A2, c: A3 }
    chai.assert.deepStrictEqual(recycle.recycle(set1, set2), set2)
  })
})

describe('getArrayByKey', () => {
  const A = summon(F => F.interface({ a: F.string(), b: F.nullable(F.string()) }, 'A'))
  type A = AType<typeof A>

  const Aa1 = A.build({ a: 'a', b: some('1') })
  const Aa1Bis = A.build({ a: 'a', b: some('1') })
  const Aa2 = A.build({ a: 'a', b: some('2') })
  const Ab1 = A.build({ a: 'b', b: some('1') })
  const Ab1Bis = A.build({ a: 'b', b: some('1') })
  const Ab2 = A.build({ a: 'b', b: some('2') })
  // const Aa2Bis = A.build({ a: 'a', b: some('2') })
  // const Aa3 = A.build({ a: 'a', b: some('3') })
  // const Aa4 = A.build({ a: 'a', b: some('4') })

  const recycle = getArrayByKey<A>(_ => _.a)(A.recycle)
  const { mustRecycle, mustNotRecycle } = makeRecycler(recycle)

  it('should recycle equals values', () => {
    mustRecycle([Aa1, Ab1], [Aa1Bis, Ab1Bis])
  })

  it('should not recycle different values', () => {
    mustNotRecycle([Aa1, Ab1], [Aa2, Ab2])
  })

  it('should not recycle different values', () => {
    const arr1 = [Aa1, Ab1]
    const arr2 = [Aa1Bis, Ab2]
    const res = recycle.recycle(arr1, arr2)
    chai.assert.deepStrictEqual(res, arr2)
    chai.assert.strictEqual(res[0], Aa1)
    chai.assert.strictEqual(res[1], Ab2)
  })

  it('should cope with new keys', () => {
    const arr1 = [Aa1]
    const arr2 = [Aa1Bis, Ab2]
    const res = recycle.recycle(arr1, arr2)
    chai.assert.deepStrictEqual(res, arr2)
    chai.assert.strictEqual(res[0], Aa1)
  })
})
