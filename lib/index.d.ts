import { Applicative, Applicative1, Applicative2, Applicative2C, Applicative3, Applicative3C } from 'fp-ts/lib/Applicative';
import { Either } from 'fp-ts/lib/Either';
import { Foldable, Foldable1, Foldable2, Foldable3 } from 'fp-ts/lib/Foldable';
import { Predicate, Refinement } from 'fp-ts/lib/function';
import { HKT, Type, Type2, Type3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Option } from 'fp-ts/lib/Option';
import { Traversable, Traversable1, Traversable2, Traversable3 } from 'fp-ts/lib/Traversable';
export declare class Iso<S, A, T = S, B = A> {
    readonly get: (s: S) => A;
    readonly reverseGet: (b: B) => T;
    readonly _tag: 'Iso';
    readonly unwrap: (s: S) => A;
    readonly to: (s: S) => A;
    readonly wrap: (b: B) => T;
    readonly from: (b: B) => T;
    constructor(get: (s: S) => A, reverseGet: (b: B) => T);
    /** reverse the `Iso`: the source becomes the target and the target becomes the source */
    reverse(): Iso<B, T, A, S>;
    modify(f: (a: A) => B): (s: S) => T;
    /** view an Iso as a Lens */
    asLens(): Lens<S, A, T, B>;
    /** view an Iso as a Prism */
    asPrism(): Prism<S, A, T, B>;
    /** view an Iso as a Optional */
    asOptional(): Optional<S, A, T, B>;
    /** view an Iso as a Traversal */
    asTraversal(): Traversal<S, A, T, B>;
    /** view an Iso as a Fold */
    asFold(): Fold<S, A>;
    /** view an Iso as a Getter */
    asGetter(): Getter<S, A>;
    /** view an Iso as a Setter */
    asSetter(): Setter<S, A, T, B>;
    /** compose an Iso with an Iso */
    compose<C, D = C>(ac: Iso<A, C, B, D>): Iso<S, C, T, D>;
    /** @alias of `compose` */
    composeIso<C, D = C>(ac: Iso<A, C, B, D>): Iso<S, C, T, D>;
    /** compose an Iso with a Lens */
    composeLens<C, D = C>(ac: Lens<A, C, B, D>): Lens<S, C, T, D>;
    /** compose an Iso with a Prism */
    composePrism<C, D = C>(ac: Prism<A, C, B, D>): Prism<S, C, T, D>;
    /** compose an Iso with an Optional */
    composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D>;
    /** compose an Iso with a Traversal */
    composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose an Iso with a Fold */
    composeFold<C>(ac: Fold<A, C>): Fold<S, C>;
    /** compose an Iso with a Getter */
    composeGetter<C>(ac: Getter<A, C>): Getter<S, C>;
    /** compose an Iso with a Setter */
    composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
}
export interface LensFromPath<S> {
    <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3], K5 extends keyof S[K1][K2][K3][K4]>(path: [K1, K2, K3, K4, K5]): Lens<S, S[K1][K2][K3][K4][K5]>;
    <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3]>(path: [K1, K2, K3, K4]): Lens<S, S[K1][K2][K3][K4]>;
    <K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(path: [K1, K2, K3]): Lens<S, S[K1][K2][K3]>;
    <K1 extends keyof S, K2 extends keyof S[K1]>(path: [K1, K2]): Lens<S, S[K1][K2]>;
    <K1 extends keyof S>(path: [K1]): Lens<S, S[K1]>;
}
export declare class Lens<S, A, T = S, B = A> {
    readonly get: (s: S) => A;
    readonly set: (b: B) => (s: S) => T;
    readonly _tag: 'Lens';
    constructor(get: (s: S) => A, set: (b: B) => (s: S) => T);
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
    static fromPath<S>(): LensFromPath<S>;
    static fromPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3], K5 extends keyof S[K1][K2][K3][K4]>(path: [K1, K2, K3, K4, K5]): Lens<S, S[K1][K2][K3][K4][K5]>;
    static fromPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3]>(path: [K1, K2, K3, K4]): Lens<S, S[K1][K2][K3][K4]>;
    static fromPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(path: [K1, K2, K3]): Lens<S, S[K1][K2][K3]>;
    static fromPath<S, K1 extends keyof S, K2 extends keyof S[K1]>(path: [K1, K2]): Lens<S, S[K1][K2]>;
    static fromPath<S, K1 extends keyof S>(path: [K1]): Lens<S, S[K1]>;
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
    static fromProp<S>(): <P extends keyof S>(prop: P) => Lens<S, S[P]>;
    static fromProp<S, P extends keyof S>(prop: P): Lens<S, S[P]>;
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
    static fromProps<S>(): <P extends keyof S>(props: Array<P>) => Lens<S, {
        [K in P]: S[K];
    }>;
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
    static fromNullableProp<S>(): <A extends S[K], K extends keyof S>(k: K, defaultValue: A) => Lens<S, NonNullable<S[K]>>;
    static fromNullableProp<S, A extends S[K], K extends keyof S>(k: K, defaultValue: A): Lens<S, NonNullable<S[K]>>;
    modify(f: (a: A) => B): (s: S) => T;
    /** view a Lens as a Optional */
    asOptional(): Optional<S, A, T, B>;
    /** view a Lens as a Traversal */
    asTraversal(): Traversal<S, A, T, B>;
    /** view a Lens as a Setter */
    asSetter(): Setter<S, A, T, B>;
    /** view a Lens as a Getter */
    asGetter(): Getter<S, A>;
    /** view a Lens as a Fold */
    asFold(): Fold<S, A>;
    /** compose a Lens with a Lens */
    compose<C, D = C>(ac: Lens<A, C, B, D>): Lens<S, C, T, D>;
    /** @alias of `compose` */
    composeLens<C, D = C>(ac: Lens<A, C, B, D>): Lens<S, C, T, D>;
    /** compose a Lens with a Getter */
    composeGetter<B>(ab: Getter<A, B>): Getter<S, B>;
    /** compose a Lens with a Fold */
    composeFold<B>(ab: Fold<A, B>): Fold<S, B>;
    /** compose a Lens with an Optional */
    composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D>;
    /** compose a Lens with an Traversal */
    composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Lens with an Setter */
    composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Lens with an Iso */
    composeIso<C, D = C>(ac: Iso<A, C, B, D>): Lens<S, C, T, D>;
    /** compose a Lens with a Prism */
    composePrism<C, D = C>(ac: Prism<A, C, B, D>): Optional<S, C, T, D>;
}
export declare class Prism<S, A, T = S, B = A> {
    readonly getOrModify: (s: S) => Either<T, A>;
    readonly reverseGet: (b: B) => T;
    readonly _tag: 'Prism';
    constructor(getOrModify: (s: S) => Either<T, A>, reverseGet: (b: B) => T);
    static fromPredicate<S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>;
    static fromPredicate<A>(predicate: Predicate<A>): Prism<A, A>;
    /**
     * Use `fromPredicate` instead
     * @deprecated
     */
    static fromRefinement<S, A extends S>(refinement: Refinement<S, A>): Prism<S, A>;
    static some<A>(): Prism<Option<A>, A>;
    getOption(s: S): Option<A>;
    modify(f: (a: A) => B): (s: S) => T;
    modifyOption(f: (a: A) => B): (s: S) => Option<T>;
    /** set the target of a Prism with a value */
    set(b: B): (s: S) => T;
    /** view a Prism as a Optional */
    asOptional(): Optional<S, A, T, B>;
    /** view a Prism as a Traversal */
    asTraversal(): Traversal<S, A, T, B>;
    /** view a Prism as a Setter */
    asSetter(): Setter<S, A, T, B>;
    /** view a Prism as a Fold */
    asFold(): Fold<S, A>;
    /** compose a Prism with a Prism */
    compose<C, D = C>(ac: Prism<A, C, B, D>): Prism<S, C, T, D>;
    /** @alias of `compose` */
    composePrism<C, D = C>(ac: Prism<A, C, B, D>): Prism<S, C, T, D>;
    /** compose a Prism with a Optional */
    composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D>;
    /** compose a Prism with a Traversal */
    composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Prism with a Fold */
    composeFold<C>(ac: Fold<A, C>): Fold<S, C>;
    /** compose a Prism with a Setter */
    composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Prism with a Iso */
    composeIso<C, D = C>(ac: Iso<A, C, B, D>): Prism<S, C, T, D>;
    /** compose a Prism with a Lens */
    composeLens<C, D = C>(ac: Lens<A, C, B, D>): Optional<S, C, T, D>;
    /** compose a Prism with a Getter */
    composeGetter<C>(ac: Getter<A, C>): Fold<S, C>;
}
declare type OptionPropertyNames<S> = {
    [K in keyof S]-?: S[K] extends Option<any> ? K : never;
}[keyof S];
declare type OptionPropertyType<S, K extends OptionPropertyNames<S>> = S[K] extends Option<infer A> ? A : never;
export declare class Optional<S, A, T = S, B = A> {
    readonly getOrModify: (s: S) => Either<T, A>;
    readonly set: (b: B) => (s: S) => T;
    readonly _tag: 'Optional';
    constructor(getOrModify: (s: S) => Either<T, A>, set: (b: B) => (s: S) => T);
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
    static fromNullableProp<S>(): <K extends keyof S>(k: K) => Optional<S, NonNullable<S[K]>>;
    static fromNullableProp<S, A extends S[K], K extends keyof S>(k: K): Optional<S, NonNullable<S[K]>>;
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
    static fromOptionProp<S>(): <P extends OptionPropertyNames<S>>(prop: P) => Optional<S, OptionPropertyType<S, P>>;
    static fromOptionProp<S>(prop: OptionPropertyNames<S>): Optional<S, OptionPropertyType<S, typeof prop>>;
    getOption(s: S): Option<A>;
    modify(f: (a: A) => B): (s: S) => T;
    modifyOption(f: (a: A) => B): (s: S) => Option<T>;
    /** view a Optional as a Traversal */
    asTraversal(): Traversal<S, A, T, B>;
    /** view an Optional as a Fold */
    asFold(): Fold<S, A>;
    /** view an Optional as a Setter */
    asSetter(): Setter<S, A, T, B>;
    /** compose a Optional with a Optional */
    compose<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D>;
    /** @alias of `compose` */
    composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Optional<S, C, T, D>;
    /** compose an Optional with a Traversal */
    composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose an Optional with a Fold */
    composeFold<C>(ac: Fold<A, C>): Fold<S, C>;
    /** compose an Optional with a Setter */
    composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
    /** compose an Optional with a Lens */
    composeLens<C, D = C>(ac: Lens<A, C, B, D>): Optional<S, C, T, D>;
    /** compose an Optional with a Prism */
    composePrism<C, D = C>(ac: Prism<A, C, B, D>): Optional<S, C, T, D>;
    /** compose an Optional with a Iso */
    composeIso<C, D = C>(ac: Iso<A, C, B, D>): Optional<S, C, T, D>;
    /** compose an Optional with a Getter */
    composeGetter<C>(ac: Getter<A, C>): Fold<S, C>;
}
export interface ModifyF<S, A, T = S, B = A> {
    <F extends URIS3>(F: Applicative3<F>): <U, L>(f: (a: A) => Type3<F, U, L, B>) => (s: S) => Type3<F, U, L, T>;
    <F extends URIS3, U, L>(F: Applicative3C<F, U, L>): (f: (a: A) => Type3<F, U, L, B>) => (s: S) => Type3<F, U, L, T>;
    <F extends URIS2>(F: Applicative2<F>): <L>(f: (a: A) => Type2<F, L, B>) => (s: S) => Type2<F, L, T>;
    <F extends URIS2, L>(F: Applicative2C<F, L>): (f: (a: A) => Type2<F, L, B>) => (s: S) => Type2<F, L, T>;
    <F extends URIS>(F: Applicative1<F>): (f: (a: A) => Type<F, B>) => (s: S) => Type<F, T>;
    <F>(F: Applicative<F>): (f: (a: A) => HKT<F, B>) => (s: S) => HKT<F, T>;
}
export declare class Traversal<S, A, T = S, B = A> {
    readonly modifyF: ModifyF<S, A, T, B>;
    readonly _tag: 'Traversal';
    constructor(modifyF: ModifyF<S, A, T, B>);
    modify(f: (a: A) => B): (s: S) => T;
    set(b: B): (s: S) => T;
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
    filter<C extends A>(this: Traversal<S, A>, refinement: Refinement<A, C>): Traversal<S, C>;
    filter(this: Traversal<S, A>, predicate: Predicate<A>): Traversal<S, A>;
    /** view a Traversal as a Fold */
    asFold(): Fold<S, A>;
    /** view a Traversal as a Setter */
    asSetter(): Setter<S, A, T, B>;
    /** compose a Traversal with a Traversal */
    compose<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D>;
    /** @alias of `compose` */
    composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Traversal with a Fold */
    composeFold<C>(ac: Fold<A, C>): Fold<S, C>;
    /** compose a Traversal with a Setter */
    composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Traversal with a Optional */
    composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Traversal with a Lens */
    composeLens<C, D = C>(ac: Lens<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Traversal with a Prism */
    composePrism<C, D = C>(ac: Prism<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Traversal with a Iso */
    composeIso<C, D = C>(ab: Iso<A, C, B, D>): Traversal<S, C, T, D>;
    /** compose a Traversal with a Getter */
    composeGetter<C>(ac: Getter<A, C>): Fold<S, C>;
}
export declare class At<S, I, A> {
    readonly at: (i: I) => Lens<S, A>;
    readonly _tag: 'At';
    constructor(at: (i: I) => Lens<S, A>);
    /** lift an instance of `At` using an `Iso` */
    fromIso<T>(iso: Iso<T, S>): At<T, I, A>;
}
export declare class Index<S, I, A> {
    readonly index: (i: I) => Optional<S, A>;
    readonly _tag: 'Index';
    constructor(index: (i: I) => Optional<S, A>);
    static fromAt<T, J, B>(at: At<T, J, Option<B>>): Index<T, J, B>;
    /** lift an instance of `Index` using an `Iso` */
    fromIso<T>(iso: Iso<T, S>): Index<T, I, A>;
}
export declare class Getter<S, A> {
    readonly get: (s: S) => A;
    readonly _tag: 'Getter';
    constructor(get: (s: S) => A);
    /** view a Getter as a Fold */
    asFold(): Fold<S, A>;
    /** compose a Getter with a Getter */
    compose<B>(ab: Getter<A, B>): Getter<S, B>;
    /** @alias of `compose` */
    composeGetter<B>(ab: Getter<A, B>): Getter<S, B>;
    /** compose a Getter with a Fold */
    composeFold<B>(ab: Fold<A, B>): Fold<S, B>;
    /** compose a Getter with a Lens */
    composeLens<B>(ab: Lens<A, B>): Getter<S, B>;
    /** compose a Getter with a Iso */
    composeIso<B>(ab: Iso<A, B>): Getter<S, B>;
    /** compose a Getter with a Optional */
    composeTraversal<B>(ab: Traversal<A, B>): Fold<S, B>;
    /** compose a Getter with a Optional */
    composeOptional<B>(ab: Optional<A, B>): Fold<S, B>;
    /** compose a Getter with a Prism */
    composePrism<B>(ab: Prism<A, B>): Fold<S, B>;
}
export declare class Fold<S, A> {
    readonly foldMap: <M>(M: Monoid<M>) => (f: (a: A) => M) => (s: S) => M;
    readonly _tag: 'Fold';
    /** get all the targets of a Fold */
    readonly getAll: (s: S) => Array<A>;
    /** check if at least one target satisfies the predicate */
    readonly exist: (p: Predicate<A>) => Predicate<S>;
    /** check if all targets satisfy the predicate */
    readonly all: (p: Predicate<A>) => Predicate<S>;
    private foldMapFirst;
    constructor(foldMap: <M>(M: Monoid<M>) => (f: (a: A) => M) => (s: S) => M);
    /** compose a Fold with a Fold */
    compose<B>(ab: Fold<A, B>): Fold<S, B>;
    /** @alias of `compose` */
    composeFold<B>(ab: Fold<A, B>): Fold<S, B>;
    /** compose a Fold with a Getter */
    composeGetter<B>(ab: Getter<A, B>): Fold<S, B>;
    /** compose a Fold with a Traversal */
    composeTraversal<B>(ab: Traversal<A, B>): Fold<S, B>;
    /** compose a Fold with a Optional */
    composeOptional<B>(ab: Optional<A, B>): Fold<S, B>;
    /** compose a Fold with a Lens */
    composeLens<B>(ab: Lens<A, B>): Fold<S, B>;
    /** compose a Fold with a Prism */
    composePrism<B>(ab: Prism<A, B>): Fold<S, B>;
    /** compose a Fold with a Iso */
    composeIso<B>(ab: Iso<A, B>): Fold<S, B>;
    /** find the first target of a Fold matching the predicate */
    find<B extends A>(p: Refinement<A, B>): (s: S) => Option<B>;
    find(p: Predicate<A>): (s: S) => Option<A>;
    /** get the first target of a Fold */
    headOption(s: S): Option<A>;
}
export declare class Setter<S, A, T = S, B = A> {
    readonly modify: (f: (a: A) => B) => (s: S) => T;
    readonly _tag: 'Setter';
    constructor(modify: (f: (a: A) => B) => (s: S) => T);
    set(b: B): (s: S) => T;
    /** compose a Setter with a Setter */
    compose<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
    /** @alias of `compose` */
    composeSetter<C, D = C>(ac: Setter<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Setter with a Traversal */
    composeTraversal<C, D = C>(ac: Traversal<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Setter with a Optional */
    composeOptional<C, D = C>(ac: Optional<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Setter with a Lens */
    composeLens<C, D = C>(ac: Lens<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Setter with a Prism */
    composePrism<C, D = C>(ac: Prism<A, C, B, D>): Setter<S, C, T, D>;
    /** compose a Setter with a Iso */
    composeIso<C, D = C>(ac: Iso<A, C, B, D>): Setter<S, C, T, D>;
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
export declare function fromTraversable<T extends URIS3>(T: Traversable3<T>): <U, L, A, B = A>() => Traversal<Type3<T, U, L, A>, A, Type3<T, U, L, B>, B>;
export declare function fromTraversable<T extends URIS2>(T: Traversable2<T>): <L, A, B = A>() => Traversal<Type2<T, L, A>, A, Type2<T, L, B>, B>;
export declare function fromTraversable<T extends URIS>(T: Traversable1<T>): <A, B = A>() => Traversal<Type<T, A>, A, Type<T, B>, B>;
export declare function fromTraversable<T>(T: Traversable<T>): <A>() => Traversal<HKT<T, A>, A>;
/** create a Fold from a Foldable */
export declare function fromFoldable<F extends URIS3>(F: Foldable3<F>): <U, L, A>() => Fold<Type3<F, U, L, A>, A>;
export declare function fromFoldable<F extends URIS2>(F: Foldable2<F>): <L, A>() => Fold<Type2<F, L, A>, A>;
export declare function fromFoldable<F extends URIS>(F: Foldable1<F>): <A>() => Fold<Type<F, A>, A>;
export declare function fromFoldable<F>(F: Foldable<F>): <A>() => Fold<HKT<F, A>, A>;
export {};
