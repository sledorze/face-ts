import * as chai from 'chai'
import { ordString, ord, Ord } from 'fp-ts/lib/Ord'
import { fromArray } from 'fp-ts/lib/Set'
import { right, isLeft } from 'fp-ts/lib/Either'
import { some, none } from 'fp-ts/lib/Option'
import { either } from 'fp-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { Errors, Branded } from 'io-ts'
import { summon, M } from '@morphic-ts/batteries/lib/summoner'
import { IoTsURI } from '../src/index' // Fake to please the test runner
import { modelIoTsStrictInterpreter } from '../src/interpreters' // Fake to please the test runner
export { IoTsURI, modelIoTsStrictInterpreter }

export type Tree = Node | Leaf
export interface Node {
  type: 'node'
  a: Tree
  b: Tree
}
export interface Leaf {
  type: 'leaf'
  v: string
}

export type GTree<A> = GNode<A> | GLeaf<A>
export interface GNode<A> {
  type: 'node'
  a: GTree<A>
  b: GTree<A>
}
export interface GLeaf<A> {
  type: 'leaf'
  v: A
}

describe('IO-TS Alt Schema', () => {
  it('refined', () => {
    interface PositiveNumberBrand {
      readonly PosNum: unique symbol
    }

    const codec = summon(F =>
      F.refined(F.number(), (x: number): x is Branded<number, PositiveNumberBrand> => x > 0, 'PosNum')
    ).type

    chai.assert.deepStrictEqual(isLeft(codec.decode(-1)), true)
    chai.assert.deepStrictEqual(codec.decode(12), right(12))
  })

  it('unknown', () => {
    // Definition
    const codec = summon(F => F.unknown()).type
    chai.assert.deepStrictEqual(codec.decode('b'), right('b'))
    chai.assert.deepStrictEqual(codec.decode(12), right(12))
  })

  it('string', () => {
    // Definition
    const codec = summon(F => F.string()).type
    chai.assert.deepStrictEqual(codec.decode('b'), right('b'))
  })

  it('bigint', () => {
    // Definition
    const codec = summon(F => F.bigint()).type
    chai.assert.deepStrictEqual(codec.decode('10'), right(BigInt(10)))
    chai.assert.deepStrictEqual(codec.encode(BigInt(10)), '10')
    chai.assert.deepStrictEqual(isLeft(codec.decode('nope')), true)
  })

  it('boolean', () => {
    // Definition
    const codec = summon(F => F.boolean()).type
    chai.assert.deepStrictEqual(codec.decode(true), right(true))
    chai.assert.deepStrictEqual(codec.decode(false), right(false))
  })

  it('stringLiteral', () => {
    // Definition
    const codec = summon(F => F.stringLiteral('x')).type

    chai.assert.deepStrictEqual(codec.decode('x'), right('x'))
  })

  it('keysOf', () => {
    // Definition
    const codec = summon(F => F.keysOf({ a: null, b: null })).type

    chai.assert.deepStrictEqual(codec.decode('a'), right('a'))
    chai.assert.deepStrictEqual(codec.decode('b'), right('b'))
    chai.assert.deepStrictEqual(isLeft(codec.decode('c')), true)
  })

  it('nullable', () => {
    const codec = summon(F => F.nullable(F.string())).type

    chai.assert.deepStrictEqual(codec.decode('a'), right(some('a')))
    chai.assert.deepStrictEqual(codec.decode(null), right(none))
    chai.assert.deepStrictEqual(isLeft(codec.decode(6)), true)
  })

  it('array', () => {
    const codec = summon(F => F.array(F.string(), {}))
    chai.assert.deepStrictEqual(codec.type.decode(['a', 'b']), right(['a', 'b']))
  })

  it('partial', () => {
    // Definition

    const codec = summon(F =>
      F.partial(
        {
          a: F.string(),
          b: F.number()
        },
        'Codec'
      )
    )

    chai.assert.deepStrictEqual(codec.type.decode({ a: 'a', b: 1 }), right({ a: 'a', b: 1 }))
    chai.assert.deepStrictEqual(codec.type.decode({ a: 'a', b: 1 }), right({ a: 'a', b: 1 }))
    chai.assert.deepStrictEqual(codec.type.decode({ b: 1 }), right({ b: 1 }))
    chai.assert.deepStrictEqual(codec.type.decode({ a: 'a' }), right({ a: 'a' }))
  })

  it('compose', () => {
    // type Foo
    const Foo = summon(F =>
      F.interface(
        {
          a: F.string(),
          b: F.number()
        },
        'Foo'
      )
    )

    // type Bar
    const Bar = summon<unknown, Bar>(F =>
      F.interface(
        {
          a: Foo(F),
          b: F.number()
        },
        'Bar'
      )
    )

    interface Bar {
      a: {
        a: string
        b: number
      }
      b: number
    }

    const eee = Bar.strictType
    either.either.map(eee.decode(1 as unknown), x => x.a)
    const fff = Foo.strictType
    either.either.map(fff.decode(1 as unknown), x => {
      const res = x.a.concat('a')
      return res
    })

    const codec = Bar
    // const codec2 = Foo

    chai.assert.deepStrictEqual(
      codec.type.decode({ a: { a: 'z', b: 12 }, b: 12 }),
      right({ a: { a: 'z', b: 12 }, b: 12 })
    )
  })

  it('date', () => {
    // type Foo
    const Foo = summon<unknown, Foo>(F =>
      F.interface(
        {
          date: F.date(),
          a: F.string()
        },
        'Foo'
      )
    )

    interface Foo {
      date: Date
      a: string
    }

    const codec = Foo

    const date = new Date()
    chai.assert.deepStrictEqual(codec.type.decode({ date: date.toISOString(), a: 'z' }), right({ date, a: 'z' }))
  })

  it('intersection', () => {
    // type Foo
    const Foo = summon(F =>
      F.interface(
        {
          a: F.string(),
          b: F.number()
        },
        'Foo'
      )
    )

    const Bar = summon(F =>
      F.interface(
        {
          c: F.string(),
          d: F.number()
        },
        'Bar'
      )
    )

    const FooBar = summon(F => F.intersection([Foo(F), Bar(F)], 'FooBar'))

    const codec = FooBar

    chai.assert.deepStrictEqual(
      codec.type.decode({ a: 'a', b: 12, c: 'a', d: 12 }),
      right({ a: 'a', b: 12, c: 'a', d: 12 })
    )
  })

  it('union', () => {
    // type Foo
    interface Foo {
      a: string
      b: number
    }
    const Foo = summon(F =>
      F.interface(
        {
          a: F.string(),
          b: F.number()
        },
        'Foo'
      )
    )

    interface Bar {
      c: string
      d: number
    }
    const Bar = summon(F =>
      F.interface(
        {
          c: F.string(),
          d: F.number()
        },
        'Bar'
      )
    )

    const FooBar = summon(F => F.union([Foo(F), Bar(F)], 'FooBar'))

    const codec = FooBar

    chai.assert.deepStrictEqual(codec.type.decode({ a: 'a', b: 12 }), right({ a: 'a', b: 12 }))
    chai.assert.deepStrictEqual(codec.type.decode({ c: 'a', d: 12 }), right({ c: 'a', d: 12 }))
    chai.assert.deepStrictEqual(isLeft(codec.type.decode({ a: 'a', d: 12 })), true)
  })

  it('taggedUnion', () => {
    // type Foo
    interface Foo {
      type: 'foo1'
      a: string
      b: number
    }
    const Foo = summon<unknown, Foo>(F =>
      F.interface(
        {
          type: F.stringLiteral('foo1'),
          a: F.string(),
          b: F.number()
        },
        'Foo'
      )
    )

    interface Bar {
      type: 'bar1'
      c: string
      d: number
    }
    const Bar = summon<unknown, Bar>(F =>
      F.interface(
        {
          type: F.stringLiteral('bar1'),
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
          foo1: Foo(F),
          bar1: Bar(F)
        },
        'FooBar'
      )
    )

    const codec = FooBar

    chai.assert.deepStrictEqual(
      codec.type.decode({ type: 'foo1', a: 'a', b: 12 }),
      right({ type: 'foo1' as 'foo1', a: 'a', b: 12 })
    )
    chai.assert.deepStrictEqual(
      codec.type.decode({ type: 'bar1', c: 'a', d: 12 }),
      right({ type: 'bar1' as 'bar1', c: 'a', d: 12 })
    )
    chai.assert.deepStrictEqual(isLeft(codec.type.decode({ a: 'a', d: 12 })), true)
  })

  it('taggedUnion', () => {
    const Foo = summon(F =>
      F.interface(
        {
          type: F.stringLiteral('foo2'),
          a: F.string()
        },
        'Foo'
      )
    )

    const Baz = summon(F =>
      F.interface(
        {
          type: F.stringLiteral('baz2'),
          b: F.number()
        },
        'Bar'
      )
    )

    const FooBar = summon(F =>
      F.taggedUnion(
        'type',
        {
          foo2: Foo(F),
          baz2: Baz(F)
        },
        'FooBar'
      )
    )

    const decoder = FooBar.type

    chai.assert.deepStrictEqual(decoder.decode({ type: 'foo2', a: 'a' }), right({ type: 'foo2' as 'foo2', a: 'a' }))
    chai.assert(isLeft(decoder.decode({ type: 'foo2', b: 3 })))
    chai.assert.deepStrictEqual(decoder.decode({ type: 'baz2', b: 1 }), right({ type: 'baz2' as 'baz2', b: 1 }))
    chai.assert(isLeft(decoder.decode({ type: 'baz2', a: 'a' })))
    chai.assert(isLeft(decoder.decode({})))
  })

  it('set from array', () => {
    const InterfA = summon(F =>
      F.interface(
        {
          a: F.string()
        },
        'InterfA'
      )
    )

    summon(F =>
      F.interface(
        {
          a: F.string(),
          b: F.array(
            F.interface(
              {
                x: F.nullable(F.string())
              },
              'X'
            ),
            {}
          )
        },
        'AB'
      )
    )

    type AType = ReturnType<typeof InterfA.build>

    const ordA: Ord<AType> = ord.contramap(ordString, x => x.a)

    const SetInterfA = summon(F => F.set(InterfA(F), ordA))

    const SetInterfAType = SetInterfA

    const datas = [{ a: 'zz' }, { a: 'vv' }]
    const decoded = SetInterfAType.type.decode([{ a: 'zz' }, { a: 'vv' }])
    chai.assert.deepStrictEqual(decoded, right(fromArray(ordA)(datas)))

    chai.assert.deepStrictEqual(
      SetInterfAType.type.encode(
        pipe(
          decoded,
          either.getOrElse<Errors, Set<{ a: string }>>(() => {
            throw new Error('bad')
          })
        )
      ),
      [{ a: 'vv' }, { a: 'zz' }]
    )
  })
})

describe('iotsObjectInterpreter', () => {
  const model = summon(F =>
    F.interface(
      {
        a: F.string(),
        b: F.number()
      },
      'AB'
    )
  )
  const partialModel = summon(F =>
    F.partial(
      {
        a: F.string(),
        b: F.number()
      },
      'AB'
    )
  )

  const valueWithExtras = { a: 'a', b: 12, c: 33 }
  const valueWithoutExtras = { a: 'a', b: 12 }

  describe('ioTsStrictObjectInterpreter', () => {
    it('interface does not keep extra values', () => {
      chai.assert.deepStrictEqual(model.strictType.decode(valueWithExtras), right(valueWithoutExtras))
    })
    it('partial does not keep extra values', () => {
      chai.assert.deepStrictEqual(partialModel.strictType.decode(valueWithExtras), right(valueWithoutExtras))
    })
  })

  describe('ioTsNonStrictObjectInterpreter', () => {
    it('interface keeps extra values', () => {
      chai.assert.deepStrictEqual(model.type.decode(valueWithExtras), right(valueWithExtras))
    })
    it('partial keeps extra values', () => {
      chai.assert.deepStrictEqual(model.type.decode(valueWithExtras), right(valueWithExtras))
    })
  })

  describe('ioTsStrictRecursiveInterpreter', () => {
    it('handles recursive types', () => {
      let nbEvals = 0
      let nbRecEvals = 0

      const Tree: M<unknown, Tree> = summon(F => {
        nbEvals += 1
        return F.recursive(Tree => {
          nbRecEvals += 1
          return F.taggedUnion(
            'type',
            {
              node: F.interface({ type: F.stringLiteral('node'), a: Tree, b: Tree }, 'Node'),
              leaf: F.interface({ type: F.stringLiteral('leaf'), v: F.string() }, 'Leaf')
            },
            'Tree'
          )
        }, 'TreeRec')
      })

      const { type } = Tree
      chai.assert.deepStrictEqual(type.is({ type: 'leaf', v: 'X' }), true)

      const firstRunNbEvals = nbEvals
      const firstRunNbRecEvals = nbRecEvals

      chai.assert.deepStrictEqual(
        type.is({ type: 'node', a: { type: 'leaf', v: 'AX' }, b: { type: 'leaf', v: 'BX' } }),
        true
      )
      chai.assert.deepStrictEqual(firstRunNbEvals, nbEvals)
      chai.assert.deepStrictEqual(firstRunNbRecEvals, nbRecEvals)
    })

    it('handles generic recursive types', () => {
      let nbEvals = 0
      let nbRecEvals = 0

      const getTree = <A>(LeafValue: M<unknown, A>): M<unknown, GTree<A>> => {
        const GTree: M<unknown, GTree<A>> = summon(F => {
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

      const { type } = getTree(numberValue)
      chai.assert.deepStrictEqual(type.is({ type: 'leaf', v: 0 }), true)
      const firstRunNbEvals = nbEvals
      const firstRunNbRecEvals = nbRecEvals

      chai.assert.deepStrictEqual(type.is({ type: 'node', a: { type: 'leaf', v: 1 }, b: { type: 'leaf', v: 2 } }), true)
      chai.assert.deepStrictEqual(firstRunNbEvals, nbEvals)
      chai.assert.deepStrictEqual(firstRunNbRecEvals, nbRecEvals)
    })
  })
})
