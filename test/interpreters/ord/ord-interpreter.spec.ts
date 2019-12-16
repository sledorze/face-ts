import * as chai from 'chai'
import { ordInterpreter } from '../../../src/interpreters/ord/interpreters'
import { lt, gt, ordNumber, ord, Ord } from 'fp-ts/lib/Ord'
import { ProgramInterpreter1 } from '../../../src/usage/materializer'
import { builderInterpreter } from '../../../src/interpreters/builder/interpreters'
import { ProgramOrderableURI } from '../../../src/utils/program-orderable'
import { cacheUnaryFunction } from '../../../src/core'
import { makeSummoner } from '../../../src/usage/summoner'

interface OrdInterpreter<E, A> {
  ord: Ord<A>
}

export type OrdInterpreterURI = 'OrdInterpreter'

declare module '../../../src/usage/interpreters-hkt' {
  interface Interpreter1<E, A> {
    OrdInterpreter: OrdInterpreter<E, A>
  }
}
export const OrdInterpreter: ProgramInterpreter1<ProgramOrderableURI, OrdInterpreterURI> = program => ({
  build: program(builderInterpreter).build,
  ord: program(ordInterpreter).ord
})

// export interface M<E, A> extends Materialized1<E, A, ProgramOrderableURI, OrdInterpreterURI> {}
// export interface UM<A> extends Materialized1<unknown, A, ProgramOrderableURI, OrdInterpreterURI> {}

// export type Prog<L, A> = Program<L, A>[ProgramOrderableURI]

const { summonAs, summonAsA, summonAsL, summon } = makeSummoner(cacheUnaryFunction, OrdInterpreter)

export { summonAs, summonAsA, summonAsL, summon }

describe('Ord', () => {
  it('returns true or false when comparing values for equality', () => {
    const Foo = summonAs(F => F.date())

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
    const Foo = summonAs(F =>
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
})
