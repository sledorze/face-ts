import { summonFor } from '../src/summoner-BASTJ'
import { fastCheckConfig } from '@morphic-ts/fastcheck-interpreters/lib/config'
import { defineFor } from '../src/usage/programs-infer'
import { ProgramUnionURI } from '../src/program'
import * as fc from 'fast-check'
import { FastCheckURI } from '@morphic-ts/fastcheck-interpreters/lib/hkt'
import { isRight } from 'fp-ts/lib/Either'

interface FastCheck {
  fc: typeof fc
}

interface AppEnv {
  [FastCheckURI]: FastCheck
}

describe('defineFor', () => {
  const { summon } = summonFor<AppEnv>({
    FastCheckURI: {
      fc
    }
  })

  const model = defineFor(ProgramUnionURI)(F =>
    F.stringCfg({ ...fastCheckConfig((_, env: FastCheck) => env.fc.string(2, 4)) })
  )

  it('can be reinterpreted by a summoner', () => {
    const morph = summon(model)
    fc.assert(fc.property(morph.arb, x => x.length >= 2 && x.length <= 4))
    fc.assert(fc.property(morph.arb, x => isRight(morph.type.decode(x))))
  })
})

describe('define', () => {
  const { summon, define } = summonFor<AppEnv>({
    FastCheckURI: {
      fc
    }
  })

  const model = define(F => F.stringCfg({ ...fastCheckConfig((_, env: FastCheck) => env.fc.string(2, 4)) }))

  it('can be reinterpreted by a summoner', () => {
    const morph = summon(model)
    fc.assert(fc.property(morph.arb, x => x.length >= 2 && x.length <= 4))
    fc.assert(fc.property(morph.arb, x => isRight(morph.type.decode(x))))
  })
})
