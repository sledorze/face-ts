import * as chai from 'chai'

import { fromEquals } from 'fp-ts/Eq'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'
import type { Either } from 'fp-ts/Either'
import { left, right } from 'fp-ts/Either'
import { some, none, Option } from 'fp-ts/Option'
import { summonFor } from './summoner.spec'

const { summon } = summonFor<{}>({})

describe('Eq', () => {
  it('bigInt', () => {
    const { eq } = summon(F => F.bigint())
    chai.assert.strictEqual(eq.equals(BigInt(10), BigInt(10)), true)
    chai.assert.strictEqual(eq.equals(BigInt(10), BigInt(11)), false)
  })

  it('newtype', () => {
    interface Test extends Newtype<{ readonly Test: unique symbol }, string> {}
    const isoTest = iso<Test>()

    const { eq } = summon(F => F.newtype<Test>('Test')(F.string()))

    const testA = isoTest.wrap('a')
    const testB = isoTest.wrap('b')
    chai.assert.strictEqual(eq.equals(testA, testA), true)
    chai.assert.strictEqual(eq.equals(testA, testB), false)
  })

  it('unknown', () => {
    const { eq } = summon(F => F.unknown())
    chai.assert.strictEqual(eq.equals('a', 'a'), true)
    chai.assert.strictEqual(eq.equals('a', 'b'), false)
    const arr1 = ['a', 'b']
    const arr2 = ['a', 'b']
    chai.assert.strictEqual(eq.equals(arr1, arr1), true)
    chai.assert.strictEqual(eq.equals(arr1, arr2), true)
  })

  it('recursive compare of circular unknown', () => {
    const { eq } = summon(F => F.unknown({ EqURI: eq => eq }))

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

    chai.assert.strictEqual(eq.equals(recDataA, recDataA), true)
    chai.assert.strictEqual(eq.equals(recDataA, recDataB), false)
  })

  it('recursive compare of non-circular unknown', () => {
    let calls = 0
    const compare = fromEquals((_a, _b) => {
      calls += 1
      return true
    })
    const morph = summon(F => F.unknown({ EqURI: _eq => compare }))

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

    chai.assert.strictEqual(morph.eq.equals(recDataA, recDataA), true)
    chai.assert.strictEqual(morph.eq.equals(recDataA, recDataB), true)
    chai.assert.strictEqual(morph.eq.equals(recDataB, recDataA), true)
    chai.assert.strictEqual(calls, 2) // 2 because eq.fromEquals does a reference comparison automatically
  })

  it('returns false when comparing incomplete values', () => {
    const Foo = summon(F =>
      F.interface(
        {
          date: F.date(),
          a: F.string()
        },
        'Foo'
      )
    )

    const { eq } = Foo

    const date = new Date(12345)
    chai.assert.strictEqual(eq.equals({ date, a: '' }, { date } as any), false)
  })

  it('eq', () => {
    const Foo = summon(F =>
      F.interface(
        {
          date: F.date(),
          a: F.string()
        },
        'Foo'
      )
    )

    const { eq } = Foo

    const date = new Date(12345)
    const date2 = new Date(12346)
    chai.assert.strictEqual(eq.equals({ date, a: '' }, { date, a: '' }), true)
    chai.assert.strictEqual(eq.equals({ date, a: '' }, { date: date2, a: '' }), false)
  })

  it('eq', () => {
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

    const { eq } = Foo

    const date = new Date(12345)
    const date2 = new Date(12346)
    chai.assert.strictEqual(
      eq.equals({ dates: [{ date }, { date }], a: '' }, { dates: [{ date }, { date }], a: '' }),
      true
    )

    chai.assert.strictEqual(
      eq.equals({ dates: [{ date: date2 }, { date }], a: '' }, { dates: [{ date }, { date: date2 }], a: '' }),
      false
    )
  })

  it('partial', () => {
    interface Foo {
      type: 'foo'
      a: Option<string>
      b: number
    }
    const Foo = summon(F =>
      F.partial(
        {
          type: F.stringLiteral('foo'),
          a: F.nullable(F.string()),
          b: F.number()
        },
        'Foo'
      )
    )

    const { eq } = Foo
    chai.assert.deepStrictEqual(eq.equals({}, {}), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, { type: 'foo' }), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: some('foo') }, { type: 'foo', a: some('foo') }), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: none }, { type: 'foo', a: none }), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: none }, { type: 'foo', a: some('foo') }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, { type: 'foo', a: some('foo') }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: some('foo') }, { type: 'foo' }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, { a: some('foo') }), false)
    chai.assert.deepStrictEqual(eq.equals({}, { type: 'foo' }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, {}), false)
  })

  it('both', () => {
    interface Foo {
      type: 'foo'
      a: Option<string>
      b: number
    }
    const Foo = summon(F =>
      F.both(
        {
          type: F.string()
        },
        {
          a: F.nullable(F.string()),
          b: F.number()
        },
        'Foo'
      )
    )

    const { eq } = Foo
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, { type: 'foo' }), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, { type: 'bar' }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: some('foo') }, { type: 'foo', a: some('foo') }), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: none }, { type: 'foo', a: none }), true)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: none }, { type: 'foo', a: some('foo') }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo' }, { type: 'foo', a: some('foo') }), false)
    chai.assert.deepStrictEqual(eq.equals({ type: 'foo', a: some('foo') }, { type: 'foo' }), false)
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

    const eq = FooBar.eq

    const fooA: Foo | Bar = { type: 'foo', a: 'a', b: 12 }
    const fooB: Foo | Bar = { type: 'foo', a: 'b', b: 12 }
    const fooC: Foo | Bar = { type: 'foo', a: 'a', b: 12 }

    const barA: Foo | Bar = { type: 'bar', c: 'a', d: 12 }
    const barB: Foo | Bar = { type: 'bar', c: 'b', d: 12 }

    chai.assert.deepStrictEqual(eq.equals(fooA, fooA), true)
    chai.assert.deepStrictEqual(eq.equals(fooA, fooC), true)
    chai.assert.deepStrictEqual(eq.equals(fooA, fooB), false)
    chai.assert.deepStrictEqual(eq.equals(fooA, barA), false)
    chai.assert.deepStrictEqual(eq.equals(barA, barB), false)
    chai.assert.deepStrictEqual(eq.equals(barB, barB), true)
  })

  it('either', () => {
    const { eq } = summon(F => F.either(F.string(), F.number()))
    const la: Either<string, number> = left('a')
    const labis: Either<string, number> = left('a')
    const r1: Either<string, number> = right(1)
    const lb: Either<string, number> = left('b')
    const r2: Either<string, number> = right(2)
    const r2bis: Either<string, number> = right(2)

    chai.assert.deepStrictEqual(eq.equals(la, la), true)
    chai.assert.deepStrictEqual(eq.equals(la, labis), true)
    chai.assert.deepStrictEqual(eq.equals(r1, r1), true)
    chai.assert.deepStrictEqual(eq.equals(r2, r2bis), true)

    chai.assert.deepStrictEqual(eq.equals(la, lb), false)
    chai.assert.deepStrictEqual(eq.equals(la, r1), false)
    chai.assert.deepStrictEqual(eq.equals(r2, r1), false)
  })

  it('option', () => {
    const { eq } = summon(F => F.option(F.string()))
    const a1 = some('a')
    const a2 = some('a')
    const b = some('b')
    const n = none

    chai.assert.deepStrictEqual(eq.equals(a1, a1), true)
    chai.assert.deepStrictEqual(eq.equals(a1, a2), true)
    chai.assert.deepStrictEqual(eq.equals(n, n), true)

    chai.assert.deepStrictEqual(eq.equals(a1, b), false)
    chai.assert.deepStrictEqual(eq.equals(a1, n), false)
  })

  it('handles generic recursive types', () => {
    type Tree = Node | Leaf
    interface Node {
      type: 'node'
      a: Tree
      b: Tree
    }
    interface Leaf {
      type: 'leaf'
      v: string
    }

    type GTree<A> = GNode<A> | GLeaf<A>
    interface GNode<A> {
      type: 'node'
      a: GTree<A>
      b: GTree<A>
    }
    interface GLeaf<A> {
      type: 'leaf'
      v: A
    }

    let nbEvals = 0
    let nbRecEvals = 0

    const getTree = <A>(LeafValue: M<{}, unknown, A>): M<{}, unknown, GTree<A>> => {
      const GTree: M<{}, unknown, GTree<A>> = summon(F => {
        nbEvals += 1
        return F.recursive(GTree => {
          nbRecEvals += 1
          return F.taggedUnion(
            'type',
            {
              node: F.interface({ type: F.stringLiteral('node'), a: GTree, b: GTree }, 'Node'),
              leaf: F.interface({ type: F.stringLiteral('leaf'), v: LeafValue(F) }, 'Leaf')
            },
            'Tree'
          )
        }, 'TreeRec')
      })
      return GTree
    }

    const numberValue = summon(F => F.number())

    const { eq } = getTree(numberValue)
    chai.assert.isTrue(eq.equals({ type: 'leaf', v: 0 }, { type: 'leaf', v: 0 }))
    const firstRunNbEvals = nbEvals
    const firstRunNbRecEvals = nbRecEvals

    chai.assert.isTrue(
      eq.equals(
        { type: 'node', a: { type: 'leaf', v: 1 }, b: { type: 'leaf', v: 2 } },
        { type: 'node', a: { type: 'leaf', v: 1 }, b: { type: 'leaf', v: 2 } }
      )
    )
    chai.assert.deepStrictEqual(firstRunNbEvals, nbEvals)
    chai.assert.deepStrictEqual(firstRunNbRecEvals, nbRecEvals)
  })
})
