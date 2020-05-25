import * as t from 'io-ts'
import { IOTSType, IoTsURI } from '../hkt'
import type { ModelAlgebraObject2, PropsKind2 } from '@morphic-ts/model-algebras/lib/object'
import { projectFieldWithEnv } from '@morphic-ts/common/lib/utils'
import type { ConfigsForType, AnyEnv } from '@morphic-ts/common/lib/config'
import { iotsApplyConfig } from '../config'
import { memo } from '@morphic-ts/common/lib/utils'

/**
 *  @since 0.0.1
 */
export const ioTsNonStrictObjectInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraObject2<IoTsURI, Env> => ({
    _F: IoTsURI,
    interface: <PropsE, PropsA>(
      props: PropsKind2<IoTsURI, PropsE, PropsA, Env>,
      name: string,
      config?: ConfigsForType<Env, PropsE, PropsA>
    ) => (env: Env) =>
      new IOTSType<PropsE, PropsA>(
        iotsApplyConfig(config)(t.type(projectFieldWithEnv(props, env)('type'), name) as any, env)
      ),
    partial: <PropsE, PropsA>(
      props: PropsKind2<IoTsURI, PropsE, PropsA, Env>,
      name: string,
      config?: ConfigsForType<Env, PropsE, PropsA>
    ) => (env: Env) =>
      new IOTSType<Partial<PropsE>, Partial<PropsA>>(
        iotsApplyConfig(config)(t.partial(projectFieldWithEnv(props, env)('type'), name) as any, env) as any
      )
  })
)

/**
 *  @since 0.0.1
 */
export const ioTsStrictObjectInterpreter = memo(
  <Env extends AnyEnv>(): ModelAlgebraObject2<IoTsURI, Env> => ({
    _F: IoTsURI,
    interface: <PropsE, PropsA>(
      props: PropsKind2<IoTsURI, PropsE, PropsA, Env>,
      name: string,
      config?: ConfigsForType<Env, PropsE, PropsA>
    ) => (env: Env) =>
      new IOTSType<PropsE, PropsA>(
        iotsApplyConfig(config)(t.strict(projectFieldWithEnv(props, env)('type'), name) as any, env)
      ),
    partial: <PropsE, PropsA>(
      props: PropsKind2<IoTsURI, PropsE, PropsA, Env>,
      name: string,
      config?: ConfigsForType<Env, PropsE, PropsA>
    ) => (env: Env) =>
      new IOTSType<Partial<PropsE>, Partial<PropsA>>(
        iotsApplyConfig(config)(t.exact(t.partial(projectFieldWithEnv(props, env)('type'), name)) as any, env) as any
      )
  })
)
