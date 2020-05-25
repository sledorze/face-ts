---
title: monocle.ts
nav_order: 4
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [MonocleFor (interface)](#monoclefor-interface)
- [MonocleFor (function)](#monoclefor-function)

---

# MonocleFor (interface)

**Signature**

```ts
export interface MonocleFor<S> {
  lensFromProp: LensFromProp<S>
  lensFromProps: LensFromProps<S>
  lensFromPath: LensFromPath<S>
  indexFromAt: IndexFromAt<S>
  optionalFromOptionProp: OptionalFromOptionProp<S>
  optionalFromNullableProp: OptionalFromNullableProp<S>
  prism: Prism<Option<S>, S>
  prismFromPredicate: PrismFromPredicate<S>
}
```

Added in v0.0.1

# MonocleFor (function)

**Signature**

```ts
export const MonocleFor = <A>(): MonocleFor<A> => ...
```

Added in v0.0.1
