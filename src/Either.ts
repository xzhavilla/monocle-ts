import { Either, right, left } from 'fp-ts/lib/Either'
import { identity } from 'fp-ts/lib/function'
import { Prism } from '.'

const r = new Prism<Either<any, any>, any>(identity, right)

export const _right = <L, A>(): Prism<Either<L, A>, A> => r

const l = new Prism<Either<any, any>, any>(e => e.fold(l => right(l), a => left(a)), left)

export const _left = <L, A>(): Prism<Either<L, A>, L> => l
