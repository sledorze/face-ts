import * as chai from 'chai'
import { lt, gt, ordNumber, ord } from 'fp-ts/lib/Ord'
import { summonFor } from './summoner'
import { Either, left, right } from 'fp-ts/lib/Either'

const { summon } = summonFor<{}>({})

describe('Ord', () => {
  it('returns true or false when comparing values for equality', () => {
    const Foo = summon(F => F.date())

    const { ord } = Foo

    const date = new Date(12345)
    const date2 = new Date(12346)
    chai.assert.strictEqual(lt(ord)(date, date2), true)
    chai.assert.strictEqual(gt(ord)(date2, date), true)
    chai.assert.strictEqual(lt(ord)(date2, date), false)
    chai.assert.strictEqual(gt(ord)(date, date2), false)
    chai.assert.strictEqual(ord.equals(date, date), true)
    chai.assert.strictEqual(ord.equals(date, date2), false)
  })

  it('can compare set', () => {
    const Foo = summon(F =>
      F.set(
        F.date(),
        ord.contramap(ordNumber, (d: Date) => d.getTime())
      )
    )

    const date = new Date(12345)
    const date2 = new Date(12346)
    const date3 = new Date(12347)
    const set1 = new Set([date, date2])
    const set2 = new Set([date2, date3])
    const set3 = new Set([date, date3])
    const isLt = lt(Foo.ord)
    chai.assert.strictEqual(isLt(set1, set3), true)
    chai.assert.strictEqual(isLt(set1, set2), true)
    chai.assert.strictEqual(isLt(set2, set3), false)

    const isGt = gt(Foo.ord)
    chai.assert.strictEqual(isGt(set3, set1), true)
    chai.assert.strictEqual(isGt(set2, set1), true)
    chai.assert.strictEqual(isGt(set3, set2), false)
  })

  it('either', () => {
    const { ord } = summon(F => F.either(F.string(), F.number()))
    const la: Either<string, number> = left('a')
    const r1: Either<string, number> = right(1)
    const lb: Either<string, number> = left('b')
    const r2: Either<string, number> = right(2)

    chai.assert.deepStrictEqual(ord.equals(la, la), true)
    chai.assert.deepStrictEqual(ord.equals(la, lb), false)

    chai.assert.deepStrictEqual(lt(ord)(la, lb), true)
    chai.assert.deepStrictEqual(gt(ord)(lb, la), true)
    chai.assert.deepStrictEqual(lt(ord)(la, r1), true)
    chai.assert.deepStrictEqual(gt(ord)(r1, la), true)
    chai.assert.deepStrictEqual(lt(ord)(r1, r2), true)
    chai.assert.deepStrictEqual(gt(ord)(r2, r1), true)
  })
})
