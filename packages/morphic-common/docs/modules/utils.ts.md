---
title: utils.ts
nav_order: 3
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [merge (constant)](#merge-constant)
- [collect (function)](#collect-function)
- [conjunction (function)](#conjunction-function)
- [mapRecord (function)](#maprecord-function)
- [memo (function)](#memo-function)
- [projectField (function)](#projectfield-function)

---

# merge (constant)

**Signature**

```ts
export const merge: typeof conjunction = ...
```

Added in v0.0.1

# collect (function)

**Signature**

```ts
export const collect = <K extends string, A, B>(d: Record<K, A>, f: (k: K, a: A) => B): Array<B> => ...
```

Added in v0.0.1

# conjunction (function)

**Signature**

```ts
export function conjunction<A, B>(...x: [A, B]): A & B
export function conjunction<A, B, C>(...x: [A, B, C]): A & B & C
export function conjunction<A, B, C, D>(...x: [A, B, C, D]): A & B & C & D
export function conjunction<A, B, C, D, E>(...x: [A, B, C, D, E]): A & B & C & D & E
export function conjunction<A, B, C, D, E, F>(...x: [A, B, C, D, E, F]): A & B & C & D & E & F
export function conjunction<A, B, C, D, E, F, G>(...x: [A, B, C, D, E, F, G]): A & B & C & D & E & F & G
export function conjunction<A, B, C, D, E, F, G, H>(...x: [A, B, C, D, E, F, G, H]): A & B & C & D & E & F & G & H
export function conjunction<A, B, C, D, E, F, G, H, I>(
  ...x: [A, B, C, D, E, F, G, H, I]
): A & B & C & D & E & F & G & H & I
export function conjunction<A, B, C, D, E, F, G, H, I, J>(
  ...x: [A, B, C, D, E, F, G, H, I, J]
): A & B & C & D & E & F & G & H & I & J
export function conjunction<A, B, C, D, E, F, G, H, I, J, K>(
  ...x: [A, B, C, D, E, F, G, H, I, J, K]
): A & B & C & D & E & F & G & H & I & J & K
export function conjunction<A, B, C, D, E, F, G, H, I, J, K, L>(
  ...x: [A, B, C, D, E, F, G, H, I, J, K, L]
): A & B & C & D & E & F & G & H & I & J & K & L
export function conjunction<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  ...x: [A, B, C, D, E, F, G, H, I, J, K, L, M]
): A & B & C & D & E & F & G & H & I & J & K & L & M { ... }
```

Added in v0.0.1

# mapRecord (function)

**Signature**

```ts
export const mapRecord = <Dic extends { [k in keyof Dic]: any }, B>(
  d: Dic,
  f: (v: Dic[keyof Dic]) => B
): { [k in keyof Dic]: B } => ...
```

Added in v0.0.1

# memo (function)

**Signature**

```ts
export const memo = <A>(get: () => A): (() => A) => ...
```

Added in v0.0.1

# projectField (function)

**Signature**

```ts
export const projectField = <T extends Record<any, Record<any, any>>>(t: T) => <K extends keyof T[keyof T]>(
  k: K
): {
  [q in keyof T]: T[q][K]
} =>
  record.record.map(t, p => ...
```

Added in v0.0.1
