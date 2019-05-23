import { left, right } from 'fp-ts/lib/Either'
import { Index, Optional } from '../index'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

export function indexNonEmptyArray<A = never>(): Index<NonEmptyArray<A>, number, A> {
  // tslint:disable-next-line: deprecation
  return new Index(
    i => new Optional(s => s.index(i).fold(left(s), a => right(a)), a => s => s.updateAt(i, a).getOrElse(s))
  )
}
