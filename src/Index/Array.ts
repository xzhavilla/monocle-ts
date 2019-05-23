import { left, right } from 'fp-ts/lib/Either'
import { Index, Optional } from '../index'
import { index, updateAt } from 'fp-ts/lib/Array'

export function indexArray<A = never>(): Index<Array<A>, number, A> {
  // tslint:disable-next-line: deprecation
  return new Index(
    i => new Optional(s => index(i, s).fold(left(s), a => right(a)), a => s => updateAt(i, a, s).getOrElse(s))
  )
}
