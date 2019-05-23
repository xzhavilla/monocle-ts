import { At } from '../index';
import { Option } from 'fp-ts/lib/Option';
import * as SM from 'fp-ts/lib/StrMap';
export declare function atStrMap<A = never>(): At<SM.StrMap<A>, string, Option<A>>;
