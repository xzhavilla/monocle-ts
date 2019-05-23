import { At } from '../index';
import { Setoid } from 'fp-ts/lib/Setoid';
export declare function atSet<A = never>(setoid: Setoid<A>): At<Set<A>, A, boolean>;
