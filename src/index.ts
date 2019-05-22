import {
  Applicative,
  Applicative1,
  Applicative2,
  Applicative2C,
  Applicative3,
  Applicative3C
} from 'fp-ts/lib/Applicative'
import { Const, getApplicative } from 'fp-ts/lib/Const'
import { Either, left, right } from 'fp-ts/lib/Either'
import { Foldable, Foldable1, Foldable2, Foldable3, foldMap } from 'fp-ts/lib/Foldable'
import { constant, identity, Predicate, Refinement } from 'fp-ts/lib/function'
import { HKT, Type, Type2, Type3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT'
import { identity as id } from 'fp-ts/lib/Identity'
import { getArrayMonoid, Monoid, monoidAll, monoidAny } from 'fp-ts/lib/Monoid'
import { fromNullable, fromPredicate, getFirstMonoid, none, Option, some } from 'fp-ts/lib/Option'
import { Traversable, Traversable1, Traversable2, Traversable3 } from 'fp-ts/lib/Traversable'

/**
 * @internal
 */
export const update = <O, K extends keyof O, A extends O[K]>(o: O, k: K, a: A): O => {
  return a === o[k] ? o : Object.assign({}, o, { [k]: a })
}

/*
  Laws:
  1. reverseGet(get(s)) = s
  2. get(reversetGet(a)) = a
*/
export class Iso<S, A, T = S, B = A> {
  readonly _tag: 'Iso' = 'Iso'
  readonly unwrap = this.get
  readonly to = this.get
  readonly wrap = this.reverseGet
  readonly from = this.reverseGet
  constructor(readonly get: (s: S) => A, readonly reverseGet: (b: B) => T) {}
  /** reverse the `Iso`: the source becomes the target and the target becomes the source */
  reverse(): Iso<B, T, A, S> {
    return new Iso(this.reverseGet, this.get)
  }

  modify(f: (a: A) => B): (s: S) => T {
    return s => this.reverseGet(f(this.get(s)))
  }

  /** view an Iso as a Lens */
  asLens(): Lens<S, A, T, B> {
    return new Lens(this.get, a => _ => this.reverseGet(a))
  }

  /** view an Iso as a Prism */
  asPrism(): Prism<S, A, T, B> {
    return new Prism(s => right(this.get(s)), this.reverseGet)
  }

  /** view an Iso as a Optional */
  asOptional(): Optional<S, A, T, B> {
    return new Optional(s => right(this.get(s)), a => _ => this.reverseGet(a))
  }

  /** view an Iso as a Traversal */
  asTraversal(): Traversal<S, A, T, B> {
    return new Traversal(<F>(F: Applicative<F>) => (f: (a: A) => HKT<F, B>) => (s: S) =>
      F.map(f(this.get(s)), a => this.reverseGet(a))
    )
  }

  /** view an Iso as a Fold */
  asFold(): Fold<S, A> {
    return new Fold(<M>(_: Monoid<M>) => (f: (a: A) => M) => s => f(this.get(s)))
  }

  /** view an Iso as a Getter */
  asGetter(): Getter<S, A> {
    return new Getter(s => this.get(s))
  }

  /** view an Iso as a Setter */
  asSetter(): Setter<S, A, T, B> {
    return new Setter(f => this.modify(f))
  }

  /** compose an Iso with an Iso */
  compose<C, D = C>(ac: Iso<A, C, B, D>): Iso<S, C, T, D> {
    return new Iso(s => ac.get(this.get(s)), b => this.reverseGet(ac.reverseGet(b)))
  }

  /** @alias of `compose` */
  composeIso<C, D = C>(ac: Iso<A, C, B, D>): Iso<S, C, T, D> {
    return this.compose(ac)
  }

  /** compose an Iso with a Lens */
  composeLens<C, D = C>(ac: Lens<A, C, B, D>): Lens<S, C, T, D> {
    return this.asLens().compose(ac)
  }

  /** compose an Iso with a Prism */
  composePrism<C, D = C>(ac: Prism<A, C, B, D>): Prism<S, C, T, D> {
    return this.asPrism().compose(ac)
  }

  /** compose an Iso with an Optional */
  composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D> {
    return this.asOptional().compose(ac)
  }

  /** compose an Iso with a Traversal */
  composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D> {
    return this.asTraversal().compose(ac)
  }

  /** compose an Iso with a Fold */
  composeFold<C>(ac: Fold<A, C>): Fold<S, C> {
    return this.asFold().compose(ac)
  }

  /** compose an Iso with a Getter */
  composeGetter<C>(ac: Getter<A, C>): Getter<S, C> {
    return this.asGetter().compose(ac)
  }

  /** compose an Iso with a Setter */
  composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return this.asSetter().compose(ac)
  }
}

export interface LensFromPath<S> {
  <
    K1 extends keyof S,
    K2 extends keyof S[K1],
    K3 extends keyof S[K1][K2],
    K4 extends keyof S[K1][K2][K3],
    K5 extends keyof S[K1][K2][K3][K4]
  >(
    path: [K1, K2, K3, K4, K5]
  ): Lens<S, S[K1][K2][K3][K4][K5]>
  <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3]>(
    path: [K1, K2, K3, K4]
  ): Lens<S, S[K1][K2][K3][K4]>
  <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(path: [K1, K2, K3]): Lens<S, S[K1][K2][K3]>
  <K1 extends keyof S, K2 extends keyof S[K1]>(path: [K1, K2]): Lens<S, S[K1][K2]>
  <K1 extends keyof S>(path: [K1]): Lens<S, S[K1]>
}

function lensFromPath(path: Array<any>): any {
  const lens = Lens.fromProp<any, any>(path[0])
  return path.slice(1).reduce((acc, prop) => acc.compose(Lens.fromProp<any, any>(prop)), lens)
}

function lensFromProp<S, P extends keyof S>(prop: P): Lens<S, S[P]> {
  return new Lens(s => s[prop], a => s => update(s, prop, a))
}

function lensFromNullableProp<S, A extends S[K], K extends keyof S>(k: K, defaultValue: A): Lens<S, A> {
  return new Lens((s: any) => fromNullable(s[k]).getOrElse(defaultValue), a => s => update(s, k, a))
}

/*
  Laws:
  1. get(set(a)(s)) = a
  2. set(get(s))(s) = s
  3. set(a)(set(a)(s)) = set(a)(s)
*/
export class Lens<S, A, T = S, B = A> {
  readonly _tag: 'Lens' = 'Lens'
  constructor(readonly get: (s: S) => A, readonly set: (b: B) => (s: S) => T) {}

  /**
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * type Person = {
   *   name: string
   *   age: number
   *   address: {
   *     city: string
   *   }
   * }
   *
   * const city = Lens.fromPath<Person>()(['address', 'city'])
   *
   * const person: Person = { name: 'Giulio', age: 43, address: { city: 'Milan' } }
   *
   * assert.strictEqual(city.get(person), 'Milan')
   * assert.deepStrictEqual(city.set('London')(person), { name: 'Giulio', age: 43, address: { city: 'London' } })
   */
  static fromPath<S>(): LensFromPath<S>
  static fromPath<
    S,
    K1 extends keyof S,
    K2 extends keyof S[K1],
    K3 extends keyof S[K1][K2],
    K4 extends keyof S[K1][K2][K3],
    K5 extends keyof S[K1][K2][K3][K4]
  >(path: [K1, K2, K3, K4, K5]): Lens<S, S[K1][K2][K3][K4][K5]>
  static fromPath<
    S,
    K1 extends keyof S,
    K2 extends keyof S[K1],
    K3 extends keyof S[K1][K2],
    K4 extends keyof S[K1][K2][K3]
  >(path: [K1, K2, K3, K4]): Lens<S, S[K1][K2][K3][K4]>
  static fromPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(
    path: [K1, K2, K3]
  ): Lens<S, S[K1][K2][K3]>
  static fromPath<S, K1 extends keyof S, K2 extends keyof S[K1]>(path: [K1, K2]): Lens<S, S[K1][K2]>
  static fromPath<S, K1 extends keyof S>(path: [K1]): Lens<S, S[K1]>
  static fromPath(): any {
    return arguments.length === 0 ? lensFromPath : lensFromPath(arguments[0])
  }

  /**
   * generate a lens from a type and a prop
   *
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * type Person = {
   *   name: string
   *   age: number
   * }
   *
   * const age = Lens.fromProp<Person>()('age')
   * // or (deprecated)
   * // const age = Lens.fromProp<Person, 'age'>('age')
   *
   * const person: Person = { name: 'Giulio', age: 43 }
   *
   * assert.strictEqual(age.get(person), 43)
   * assert.deepStrictEqual(age.set(44)(person), { name: 'Giulio', age: 44 })
   */
  static fromProp<S>(): <P extends keyof S>(prop: P) => Lens<S, S[P]>
  static fromProp<S, P extends keyof S>(prop: P): Lens<S, S[P]>
  static fromProp(): any {
    return arguments.length === 0 ? lensFromProp : lensFromProp<any, any>(arguments[0])
  }

  /**
   * generate a lens from a type and an array of props
   *
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * interface Person {
   *   name: string
   *   age: number
   *   rememberMe: boolean
   * }
   *
   * const lens = Lens.fromProps<Person>()(['name', 'age'])
   *
   * const person: Person = { name: 'Giulio', age: 44, rememberMe: true }
   *
   * assert.deepStrictEqual(lens.get(person), { name: 'Giulio', age: 44 })
   * assert.deepStrictEqual(lens.set({ name: 'Guido', age: 47 })(person), { name: 'Guido', age: 47, rememberMe: true })
   */
  static fromProps<S>(): <P extends keyof S>(props: Array<P>) => Lens<S, { [K in P]: S[K] }> {
    return props => {
      const len = props.length
      return new Lens(
        s => {
          const r: any = {}
          for (let i = 0; i < len; i++) {
            const k = props[i]
            r[k] = s[k]
          }
          return r
        },
        a => s => {
          for (let i = 0; i < len; i++) {
            const k = props[i]
            if (a[k] !== s[k]) {
              return Object.assign({}, s, a)
            }
          }
          return s
        }
      )
    }
  }

  /**
   * generate a lens from a type and a prop whose type is nullable
   *
   * @example
   * import { Lens } from 'monocle-ts'
   *
   * interface Outer {
   *   inner?: Inner
   * }
   *
   * interface Inner {
   *   value: number
   *   foo: string
   * }
   *
   * const inner = Lens.fromNullableProp<Outer>()('inner', { value: 0, foo: 'foo' })
   * const value = Lens.fromProp<Inner>()('value')
   * const lens = inner.compose(value)
   *
   * assert.deepStrictEqual(lens.set(1)({})), { inner: { value: 1, foo: 'foo' } })
   * assert.strictEqual(lens.get({})), 0)
   * assert.deepStrictEqual(lens.set(1)({ inner: { value: 1, foo: 'bar' } })), { inner: { value: 1, foo: 'bar' } })
   * assert.strictEqual(lens.get({ inner: { value: 1, foo: 'bar' } })), 1)
   */
  static fromNullableProp<S>(): <A extends S[K], K extends keyof S>(k: K, defaultValue: A) => Lens<S, NonNullable<S[K]>>
  static fromNullableProp<S, A extends S[K], K extends keyof S>(k: K, defaultValue: A): Lens<S, NonNullable<S[K]>>
  static fromNullableProp(): any {
    return arguments.length === 0
      ? lensFromNullableProp
      : lensFromNullableProp<any, any, any>(arguments[0], arguments[1])
  }

  modify(f: (a: A) => B): (s: S) => T {
    return s => this.set(f(this.get(s)))(s)
  }

  /** view a Lens as a Optional */
  asOptional(): Optional<S, A, T, B> {
    return new Optional(s => right(this.get(s)), this.set)
  }

  /** view a Lens as a Traversal */
  asTraversal(): Traversal<S, A, T, B> {
    return new Traversal(<F>(F: Applicative<F>) => (f: (a: A) => HKT<F, B>) => (s: S) =>
      F.map(f(this.get(s)), a => this.set(a)(s))
    )
  }

  /** view a Lens as a Setter */
  asSetter(): Setter<S, A, T, B> {
    return new Setter(f => this.modify(f))
  }

  /** view a Lens as a Getter */
  asGetter(): Getter<S, A> {
    return new Getter(s => this.get(s))
  }

  /** view a Lens as a Fold */
  asFold(): Fold<S, A> {
    return new Fold(<M>(_: Monoid<M>) => (f: (a: A) => M) => s => f(this.get(s)))
  }

  /** compose a Lens with a Lens */
  compose<C, D = C>(ac: Lens<A, C, B, D>): Lens<S, C, T, D> {
    return new Lens(s => ac.get(this.get(s)), b => s => this.set(ac.set(b)(this.get(s)))(s))
  }

  /** @alias of `compose` */
  composeLens<C, D = C>(ac: Lens<A, C, B, D>): Lens<S, C, T, D> {
    return this.compose(ac)
  }

  /** compose a Lens with a Getter */
  composeGetter<B>(ab: Getter<A, B>): Getter<S, B> {
    return this.asGetter().compose(ab)
  }

  /** compose a Lens with a Fold */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B> {
    return this.asFold().compose(ab)
  }

  /** compose a Lens with an Optional */
  composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D> {
    return this.asOptional().compose(ac)
  }

  /** compose a Lens with an Traversal */
  composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D> {
    return this.asTraversal().compose(ac)
  }

  /** compose a Lens with an Setter */
  composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return this.asSetter().compose(ac)
  }

  /** compose a Lens with an Iso */
  composeIso<C, D = C>(ac: Iso<A, C, B, D>): Lens<S, C, T, D> {
    return this.compose(ac.asLens())
  }

  /** compose a Lens with a Prism */
  composePrism<C, D = C>(ac: Prism<A, C, B, D>): Optional<S, C, T, D> {
    return this.asOptional().compose(ac.asOptional())
  }
}

/*
  Laws:
  1. getOption(s).fold(s, reverseGet) = s
  2. getOption(reverseGet(a)) = Some(a)
*/
export class Prism<S, A, T = S, B = A> {
  readonly _tag: 'Prism' = 'Prism'
  constructor(readonly getOrModify: (s: S) => Either<T, A>, readonly reverseGet: (b: B) => T) {}

  static fromPredicate<S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>
  static fromPredicate<A>(predicate: Predicate<A>): Prism<A, A>
  static fromPredicate<A>(predicate: Predicate<A>): Prism<A, A> {
    return new Prism(s => (predicate(s) ? right(s) : left(s)), identity)
  }

  /**
   * Use `fromPredicate` instead
   * @deprecated
   */
  static fromRefinement<S, A extends S>(refinement: Refinement<S, A>): Prism<S, A> {
    return new Prism(s => (refinement(s) ? right(s) : left(s)), identity)
  }

  static some<A>(): Prism<Option<A>, A> {
    return somePrism
  }

  getOption(s: S): Option<A> {
    return this.getOrModify(s).fold(constant(none), some)
  }

  modify(f: (a: A) => B): (s: S) => T {
    return s => this.getOrModify(s).fold(identity, v => this.reverseGet(f(v)))
  }

  modifyOption(f: (a: A) => B): (s: S) => Option<T> {
    return s => this.getOption(s).map(v => this.reverseGet(f(v)))
  }

  /** set the target of a Prism with a value */
  set(b: B): (s: S) => T {
    return this.modify(() => b)
  }

  /** view a Prism as a Optional */
  asOptional(): Optional<S, A, T, B> {
    return new Optional(this.getOrModify, b => this.set(b))
  }

  /** view a Prism as a Traversal */
  asTraversal(): Traversal<S, A, T, B> {
    return new Traversal(<F>(F: Applicative<F>) => (f: (a: A) => HKT<F, B>) => (s: S) =>
      this.getOrModify(s).fold(F.of, a => F.map(f(a), b => this.set(b)(s)))
    )
  }

  /** view a Prism as a Setter */
  asSetter(): Setter<S, A, T, B> {
    return new Setter(f => this.modify(f))
  }

  /** view a Prism as a Fold */
  asFold(): Fold<S, A> {
    return new Fold(<M>(M: Monoid<M>) => (f: (a: A) => M) => s => this.getOption(s).fold(M.empty, f))
  }

  /** compose a Prism with a Prism */
  compose<C, D = C>(ac: Prism<A, C, B, D>): Prism<S, C, T, D> {
    return new Prism(
      s => this.getOrModify(s).chain(a => ac.getOrModify(a).bimap(b => this.set(b)(s), identity)),
      b => this.reverseGet(ac.reverseGet(b))
    )
  }

  /** @alias of `compose` */
  composePrism<C, D = C>(ac: Prism<A, C, B, D>): Prism<S, C, T, D> {
    return this.compose(ac)
  }

  /** compose a Prism with a Optional */
  composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D> {
    return this.asOptional().compose(ac)
  }

  /** compose a Prism with a Traversal */
  composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D> {
    return this.asTraversal().compose(ac)
  }

  /** compose a Prism with a Fold */
  composeFold<C>(ac: Fold<A, C>): Fold<S, C> {
    return this.asFold().compose(ac)
  }

  /** compose a Prism with a Setter */
  composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return this.asSetter().compose(ac)
  }

  /** compose a Prism with a Iso */
  composeIso<C, D = C>(ac: Iso<A, C, B, D>): Prism<S, C, T, D> {
    return this.compose(ac.asPrism())
  }

  /** compose a Prism with a Lens */
  composeLens<C, D = C>(ac: Lens<A, C, B, D>): Optional<S, C, T, D> {
    return this.asOptional().compose(ac.asOptional())
  }

  /** compose a Prism with a Getter */
  composeGetter<C>(ac: Getter<A, C>): Fold<S, C> {
    return this.asFold().compose(ac.asFold())
  }
}

const somePrism: Prism<Option<any>, any> = new Prism(
  s => s.foldL<Either<Option<any>, any>>(() => left(none), right),
  some
)

function optionalFromNullableProp<S, K extends keyof S>(k: K): Optional<S, NonNullable<S[K]>> {
  return new Optional((s: any) => fromNullable(s[k]).foldL(() => left(s), right), a => s => update(s, k, a))
}

type OptionPropertyNames<S> = { [K in keyof S]-?: S[K] extends Option<any> ? K : never }[keyof S]
type OptionPropertyType<S, K extends OptionPropertyNames<S>> = S[K] extends Option<infer A> ? A : never

function optionalFromOptionProp<S, K extends OptionPropertyNames<S>>(k: K): Optional<S, OptionPropertyType<S, K>> {
  return lensFromProp<S, K>(k).composePrism(somePrism as any)
}

/*
  Laws:
  1. getOption(s).fold(() => s, a => set(a)(s)) = s
  2. getOption(set(a)(s)) = getOption(s).map(_ => a)
  3. set(a)(set(a)(s)) = set(a)(s)
*/
export class Optional<S, A, T = S, B = A> {
  readonly _tag: 'Optional' = 'Optional'
  constructor(readonly getOrModify: (s: S) => Either<T, A>, readonly set: (b: B) => (s: S) => T) {}

  /**
   * @example
   * import { Optional, Lens } from 'monocle-ts'
   *
   * interface Phone {
   *   number: string
   * }
   * interface Employment {
   *   phone?: Phone
   * }
   * interface Info {
   *   employment?: Employment
   * }
   * interface Response {
   *   info?: Info
   * }
   *
   * const info = Optional.fromNullableProp<Response>()('info')
   * const employment = Optional.fromNullableProp<Info>()('employment')
   * const phone = Optional.fromNullableProp<Employment>()('phone')
   * const number = Lens.fromProp<Phone>()('number')
   * const numberFromResponse = info
   *   .compose(employment)
   *   .compose(phone)
   *   .composeLens(number)
   *
   * const response1: Response = {
   *   info: {
   *     employment: {
   *       phone: {
   *         number: '555-1234'
   *       }
   *     }
   *   }
   * }
   * const response2: Response = {
   *   info: {
   *     employment: {}
   *   }
   * }
   *
   * numberFromResponse.getOption(response1) // some('555-1234')
   * numberFromResponse.getOption(response2) // none
   */
  static fromNullableProp<S>(): <K extends keyof S>(k: K) => Optional<S, NonNullable<S[K]>>
  static fromNullableProp<S, A extends S[K], K extends keyof S>(k: K): Optional<S, NonNullable<S[K]>>
  static fromNullableProp(): any {
    return arguments.length === 0 ? optionalFromNullableProp : optionalFromNullableProp<any, any>(arguments[0])
  }

  /**
   * @example
   * import { Optional, Lens } from 'monocle-ts'
   * import { Option } from 'fp-ts/lib/Option'
   *
   * interface Phone {
   *   number: string
   * }
   * interface Employment {
   *   phone: Option<Phone>
   * }
   * interface Info {
   *   employment: Option<Employment>
   * }
   * interface Response {
   *   info: Option<Info>
   * }
   *
   * const info = Optional.fromOptionProp<Response>('info')
   * const employment = Optional.fromOptionProp<Info>('employment')
   * const phone = Optional.fromOptionProp<Employment>('phone')
   * const number = Lens.fromProp<Phone>()('number')
   * export const numberFromResponse = info
   *   .compose(employment)
   *   .compose(phone)
   *   .composeLens(number)
   */
  static fromOptionProp<S>(): <P extends OptionPropertyNames<S>>(prop: P) => Optional<S, OptionPropertyType<S, P>>
  static fromOptionProp<S>(prop: OptionPropertyNames<S>): Optional<S, OptionPropertyType<S, typeof prop>>
  static fromOptionProp(): any {
    return arguments.length === 0 ? optionalFromOptionProp : optionalFromOptionProp<any, any>(arguments[0])
  }

  getOption(s: S): Option<A> {
    return this.getOrModify(s).fold(constant(none), some)
  }

  modify(f: (a: A) => B): (s: S) => T {
    return s => this.getOrModify(s).fold(identity, v => this.set(f(v))(s))
  }

  modifyOption(f: (a: A) => B): (s: S) => Option<T> {
    return s => this.getOption(s).map(a => this.set(f(a))(s))
  }

  /** view a Optional as a Traversal */
  asTraversal(): Traversal<S, A, T, B> {
    return new Traversal(<F>(F: Applicative<F>) => (f: (a: A) => HKT<F, B>) => (s: S) =>
      this.getOrModify(s).fold(F.of, a => F.map(f(a), (b: B) => this.set(b)(s)))
    )
  }

  /** view an Optional as a Fold */
  asFold(): Fold<S, A> {
    return new Fold(<M>(M: Monoid<M>) => (f: (a: A) => M) => s => this.getOption(s).fold(M.empty, f))
  }

  /** view an Optional as a Setter */
  asSetter(): Setter<S, A, T, B> {
    return new Setter(f => this.modify(f))
  }

  /** compose a Optional with a Optional */
  compose<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D> {
    return new Optional<S, C, T, D>(
      s => this.getOrModify(s).chain(a => ac.getOrModify(a).bimap(b => this.set(b)(s), identity)),
      b => this.modify(ac.set(b))
    )
  }

  /** @alias of `compose` */
  composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D> {
    return this.compose(ac)
  }

  /** compose an Optional with a Traversal */
  composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D> {
    return this.asTraversal().compose(ac)
  }

  /** compose an Optional with a Fold */
  composeFold<C>(ac: Fold<A, C>): Fold<S, C> {
    return this.asFold().compose(ac)
  }

  /** compose an Optional with a Setter */
  composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return this.asSetter().compose(ac)
  }

  /** compose an Optional with a Lens */
  composeLens<C, D = C>(ac: Lens<A, C, B, D>): Optional<S, C, T, D> {
    return this.compose(ac.asOptional())
  }

  /** compose an Optional with a Prism */
  composePrism<C, D = C>(ac: Prism<A, C, B, D>): Optional<S, C, T, D> {
    return this.compose(ac.asOptional())
  }

  /** compose an Optional with a Iso */
  composeIso<C, D = C>(ac: Iso<A, C, B, D>): Optional<S, C, T, D> {
    return this.compose(ac.asOptional())
  }

  /** compose an Optional with a Getter */
  composeGetter<C>(ac: Getter<A, C>): Fold<S, C> {
    return this.asFold().compose(ac.asFold())
  }
}

export interface ModifyF<S, A, T = S, B = A> {
  <F extends URIS3>(F: Applicative3<F>): <U, L>(f: (a: A) => Type3<F, U, L, B>) => (s: S) => Type3<F, U, L, T>
  <F extends URIS3, U, L>(F: Applicative3C<F, U, L>): (f: (a: A) => Type3<F, U, L, B>) => (s: S) => Type3<F, U, L, T>
  <F extends URIS2>(F: Applicative2<F>): <L>(f: (a: A) => Type2<F, L, B>) => (s: S) => Type2<F, L, T>
  <F extends URIS2, L>(F: Applicative2C<F, L>): (f: (a: A) => Type2<F, L, B>) => (s: S) => Type2<F, L, T>
  <F extends URIS>(F: Applicative1<F>): (f: (a: A) => Type<F, B>) => (s: S) => Type<F, T>
  <F>(F: Applicative<F>): (f: (a: A) => HKT<F, B>) => (s: S) => HKT<F, T>
}

export class Traversal<S, A, T = S, B = A> {
  readonly _tag: 'Traversal' = 'Traversal'
  constructor(
    // Van Laarhoven representation
    readonly modifyF: ModifyF<S, A, T, B>
  ) {}

  modify(f: (a: A) => B): (s: S) => T {
    return s => this.modifyF(id)(a => id.of(f(a)))(s).extract()
  }

  set(b: B): (s: S) => T {
    return this.modify(constant(b))
  }

  /**
   * focus the items matched by a traversal to those that match a predicate
   *
   * @example
   * import { fromTraversable, Lens } from 'monocle-ts'
   * import { array } from 'fp-ts/lib/Array'
   *
   * interface Person {
   *   name: string;
   *   cool: boolean;
   * }
   *
   * const peopleTraversal = fromTraversable(array)<Person>()
   * const coolLens = Lens.fromProp<Person>()('cool')
   * const people = [{name: 'bill', cool: false}, {name: 'jill', cool: true}]
   *
   * const actual = peopleTraversal.filter(p => p.name === 'bill').composeLens(coolLens)
   *   .set(true)(people)
   *
   * assert.deepStrictEqual(actual, [{name: 'bill', cool: true}, {name: 'jill', cool: true}])
   */
  filter<C extends A>(this: Traversal<S, A>, refinement: Refinement<A, C>): Traversal<S, C>
  filter(this: Traversal<S, A>, predicate: Predicate<A>): Traversal<S, A>
  filter(this: Traversal<S, A>, predicate: Predicate<A>): Traversal<S, A> {
    return this.composePrism(Prism.fromPredicate(predicate))
  }

  /** view a Traversal as a Fold */
  asFold(): Fold<S, A> {
    return new Fold(<M>(M: Monoid<M>) => (f: (a: A) => M) => s =>
      this.modifyF(getApplicative(M))(a => new Const(f(a)))(s).fold(identity)
    )
  }

  /** view a Traversal as a Setter */
  asSetter(): Setter<S, A, T, B> {
    return new Setter(f => this.modify(f))
  }

  /** compose a Traversal with a Traversal */
  compose<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D> {
    return new Traversal<S, C, T, D>(<F>(F: Applicative<F>) => (f: (a: C) => HKT<F, D>) =>
      this.modifyF(F)(ac.modifyF(F)(f))
    )
  }

  /** @alias of `compose` */
  composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D> {
    return this.compose(ac)
  }

  /** compose a Traversal with a Fold */
  composeFold<C>(ac: Fold<A, C>): Fold<S, C> {
    return this.asFold().compose(ac)
  }

  /** compose a Traversal with a Setter */
  composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return this.asSetter().compose(ac)
  }

  /** compose a Traversal with a Optional */
  composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Traversal<S, C, T, D> {
    return this.compose(ac.asTraversal())
  }

  /** compose a Traversal with a Lens */
  composeLens<C, D = C>(ac: Lens<A, C, B, D>): Traversal<S, C, T, D> {
    return this.compose(ac.asTraversal())
  }

  /** compose a Traversal with a Prism */
  composePrism<C, D = C>(ac: Prism<A, C, B, D>): Traversal<S, C, T, D> {
    return this.compose(ac.asTraversal())
  }

  /** compose a Traversal with a Iso */
  composeIso<C, D = C>(ab: Iso<A, C, B, D>): Traversal<S, C, T, D> {
    return this.compose(ab.asTraversal())
  }

  /** compose a Traversal with a Getter */
  composeGetter<C>(ac: Getter<A, C>): Fold<S, C> {
    return this.asFold().compose(ac.asFold())
  }
}

export class At<S, I, A> {
  readonly _tag: 'At' = 'At'
  constructor(readonly at: (i: I) => Lens<S, A>) {}

  /** lift an instance of `At` using an `Iso` */
  fromIso<T>(iso: Iso<T, S>): At<T, I, A> {
    return new At(i => iso.composeLens(this.at(i)))
  }
}

export class Index<S, I, A> {
  readonly _tag: 'Index' = 'Index'
  constructor(readonly index: (i: I) => Optional<S, A>) {}

  static fromAt<T, J, B>(at: At<T, J, Option<B>>): Index<T, J, B> {
    return new Index(i => at.at(i).composePrism(Prism.some()))
  }

  /** lift an instance of `Index` using an `Iso` */
  fromIso<T>(iso: Iso<T, S>): Index<T, I, A> {
    return new Index(i => iso.composeOptional(this.index(i)))
  }
}

export class Getter<S, A> {
  readonly _tag: 'Getter' = 'Getter'
  constructor(readonly get: (s: S) => A) {}

  /** view a Getter as a Fold */
  asFold(): Fold<S, A> {
    return new Fold(<M>(_: Monoid<M>) => (f: (a: A) => M) => s => f(this.get(s)))
  }

  /** compose a Getter with a Getter */
  compose<B>(ab: Getter<A, B>): Getter<S, B> {
    return new Getter(s => ab.get(this.get(s)))
  }

  /** @alias of `compose` */
  composeGetter<B>(ab: Getter<A, B>): Getter<S, B> {
    return this.compose(ab)
  }

  /** compose a Getter with a Fold */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B> {
    return this.asFold().compose(ab)
  }

  /** compose a Getter with a Lens */
  composeLens<B>(ab: Lens<A, B>): Getter<S, B> {
    return this.compose(ab.asGetter())
  }

  /** compose a Getter with a Iso */
  composeIso<B>(ab: Iso<A, B>): Getter<S, B> {
    return this.compose(ab.asGetter())
  }

  /** compose a Getter with a Optional */
  composeTraversal<B>(ab: Traversal<A, B>): Fold<S, B> {
    return this.asFold().compose(ab.asFold())
  }

  /** compose a Getter with a Optional */
  composeOptional<B>(ab: Optional<A, B>): Fold<S, B> {
    return this.asFold().compose(ab.asFold())
  }

  /** compose a Getter with a Prism */
  composePrism<B>(ab: Prism<A, B>): Fold<S, B> {
    return this.asFold().compose(ab.asFold())
  }
}

export class Fold<S, A> {
  readonly _tag: 'Fold' = 'Fold'
  /** get all the targets of a Fold */
  readonly getAll: (s: S) => Array<A>
  /** check if at least one target satisfies the predicate */
  readonly exist: (p: Predicate<A>) => Predicate<S>
  /** check if all targets satisfy the predicate */
  readonly all: (p: Predicate<A>) => Predicate<S>
  private foldMapFirst: (f: (a: A) => Option<A>) => (s: S) => Option<A>
  constructor(readonly foldMap: <M>(M: Monoid<M>) => (f: (a: A) => M) => (s: S) => M) {
    this.getAll = foldMap(getArrayMonoid<A>())(a => [a])
    this.exist = foldMap(monoidAny)
    this.all = foldMap(monoidAll)
    this.foldMapFirst = foldMap(getFirstMonoid())
  }

  /** compose a Fold with a Fold */
  compose<B>(ab: Fold<A, B>): Fold<S, B> {
    return new Fold(<M>(M: Monoid<M>) => (f: (b: B) => M) => this.foldMap(M)(ab.foldMap(M)(f)))
  }

  /** @alias of `compose` */
  composeFold<B>(ab: Fold<A, B>): Fold<S, B> {
    return this.compose(ab)
  }

  /** compose a Fold with a Getter */
  composeGetter<B>(ab: Getter<A, B>): Fold<S, B> {
    return this.compose(ab.asFold())
  }

  /** compose a Fold with a Traversal */
  composeTraversal<B>(ab: Traversal<A, B>): Fold<S, B> {
    return this.compose(ab.asFold())
  }

  /** compose a Fold with a Optional */
  composeOptional<B>(ab: Optional<A, B>): Fold<S, B> {
    return this.compose(ab.asFold())
  }

  /** compose a Fold with a Lens */
  composeLens<B>(ab: Lens<A, B>): Fold<S, B> {
    return this.compose(ab.asFold())
  }

  /** compose a Fold with a Prism */
  composePrism<B>(ab: Prism<A, B>): Fold<S, B> {
    return this.compose(ab.asFold())
  }

  /** compose a Fold with a Iso */
  composeIso<B>(ab: Iso<A, B>): Fold<S, B> {
    return this.compose(ab.asFold())
  }

  /** find the first target of a Fold matching the predicate */
  find<B extends A>(p: Refinement<A, B>): (s: S) => Option<B>
  find(p: Predicate<A>): (s: S) => Option<A>
  find(p: Predicate<A>): (s: S) => Option<A> {
    return this.foldMapFirst(fromPredicate(p))
  }

  /** get the first target of a Fold */
  headOption(s: S): Option<A> {
    return this.find(() => true)(s)
  }
}

export class Setter<S, A, T = S, B = A> {
  readonly _tag: 'Setter' = 'Setter'
  constructor(readonly modify: (f: (a: A) => B) => (s: S) => T) {}

  set(b: B): (s: S) => T {
    return this.modify(constant(b))
  }

  /** compose a Setter with a Setter */
  compose<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return new Setter(f => this.modify(ac.modify(f)))
  }

  /** @alias of `compose` */
  composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D> {
    return this.compose(ac)
  }

  /** compose a Setter with a Traversal */
  composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Setter<S, C, T, D> {
    return this.compose(ac.asSetter())
  }

  /** compose a Setter with a Optional */
  composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Setter<S, C, T, D> {
    return this.compose(ac.asSetter())
  }

  /** compose a Setter with a Lens */
  composeLens<C, D = C>(ac: Lens<A, C, B, D>): Setter<S, C, T, D> {
    return this.compose(ac.asSetter())
  }

  /** compose a Setter with a Prism */
  composePrism<C, D = C>(ac: Prism<A, C, B, D>): Setter<S, C, T, D> {
    return this.compose(ac.asSetter())
  }

  /** compose a Setter with a Iso */
  composeIso<C, D = C>(ac: Iso<A, C, B, D>): Setter<S, C, T, D> {
    return this.compose(ac.asSetter())
  }
}

/**
 * create a Traversal from a Traversable
 *
 * @example
 * import { Lens, fromTraversable } from 'monocle-ts'
 * import { array } from 'fp-ts/lib/Array'
 *
 * interface Tweet {
 *   text: string
 * }
 *
 * interface Tweets {
 *   tweets: Tweet[]
 * }
 *
 * const tweetsLens = Lens.fromProp<Tweets>()('tweets')
 * const tweetTextLens = Lens.fromProp<Tweet>()('text')
 * const tweetTraversal = fromTraversable(array)<Tweet>()
 * const composedTraversal = tweetsLens.composeTraversal(tweetTraversal).composeLens(tweetTextLens)
 *
 * const tweet1: Tweet = { text: 'hello world' }
 * const tweet2: Tweet = { text: 'foobar' }
 * const model: Tweets = { tweets: [tweet1, tweet2] }
 *
 * const actual = composedTraversal.modify(text =>
 *   text
 *     .split('')
 *     .reverse()
 *     .join('')
 * )(model)
 *
 * assert.deepStrictEqual(actual, { tweets: [ { text: 'dlrow olleh' }, { text: 'raboof' } ] })
 */
export function fromTraversable<T extends URIS3>(
  T: Traversable3<T>
): <U, L, A, B = A>() => Traversal<Type3<T, U, L, A>, A, Type3<T, U, L, B>, B>
export function fromTraversable<T extends URIS2>(
  T: Traversable2<T>
): <L, A, B = A>() => Traversal<Type2<T, L, A>, A, Type2<T, L, B>, B>
export function fromTraversable<T extends URIS>(
  T: Traversable1<T>
): <A, B = A>() => Traversal<Type<T, A>, A, Type<T, B>, B>
// tslint:disable-next-line: deprecation
export function fromTraversable<T>(T: Traversable<T>): <A>() => Traversal<HKT<T, A>, A>
// tslint:disable-next-line: deprecation
export function fromTraversable<T>(T: Traversable<T>): <A, B = A>() => Traversal<HKT<T, A>, A, HKT<T, B>, B> {
  return <A, B = A>() =>
    new Traversal(<F>(F: Applicative<F>) => {
      const traverseF = T.traverse(F)
      return (f: (a: A) => HKT<F, B>) => (s: HKT<T, A>) => traverseF(s, f)
    })
}

/** create a Fold from a Foldable */
export function fromFoldable<F extends URIS3>(F: Foldable3<F>): <U, L, A>() => Fold<Type3<F, U, L, A>, A>
export function fromFoldable<F extends URIS2>(F: Foldable2<F>): <L, A>() => Fold<Type2<F, L, A>, A>
export function fromFoldable<F extends URIS>(F: Foldable1<F>): <A>() => Fold<Type<F, A>, A>
// tslint:disable-next-line: deprecation
export function fromFoldable<F>(F: Foldable<F>): <A>() => Fold<HKT<F, A>, A>
// tslint:disable-next-line: deprecation
export function fromFoldable<F>(F: Foldable<F>): <A>() => Fold<HKT<F, A>, A> {
  return <A>() =>
    new Fold<HKT<F, A>, A>(<M>(M: Monoid<M>) => {
      const foldMapFM = foldMap(F, M)
      return (f: (a: A) => M) => s => foldMapFM(s, f)
    })
}
