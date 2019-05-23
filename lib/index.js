"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Const_1 = require("fp-ts/lib/Const");
var Either_1 = require("fp-ts/lib/Either");
var Foldable_1 = require("fp-ts/lib/Foldable");
var function_1 = require("fp-ts/lib/function");
var Identity_1 = require("fp-ts/lib/Identity");
var Monoid_1 = require("fp-ts/lib/Monoid");
var Option_1 = require("fp-ts/lib/Option");
/**
 * @internal
 */
exports.update = function (o, k, a) {
    var _a;
    return a === o[k] ? o : Object.assign({}, o, (_a = {}, _a[k] = a, _a));
};
/*
  Laws:
  1. reverseGet(get(s)) = s
  2. get(reversetGet(a)) = a
*/
var Iso = /** @class */ (function () {
    function Iso(get, reverseGet) {
        this.get = get;
        this.reverseGet = reverseGet;
        this._tag = 'Iso';
        this.unwrap = this.get;
        this.to = this.get;
        this.wrap = this.reverseGet;
        this.from = this.reverseGet;
    }
    /** reverse the `Iso`: the source becomes the target and the target becomes the source */
    Iso.prototype.reverse = function () {
        return new Iso(this.reverseGet, this.get);
    };
    Iso.prototype.modify = function (f) {
        var _this = this;
        return function (s) { return _this.reverseGet(f(_this.get(s))); };
    };
    /** view an Iso as a Lens */
    Iso.prototype.asLens = function () {
        var _this = this;
        return new Lens(this.get, function (a) { return function (_) { return _this.reverseGet(a); }; });
    };
    /** view an Iso as a Prism */
    Iso.prototype.asPrism = function () {
        var _this = this;
        return new Prism(function (s) { return Either_1.right(_this.get(s)); }, this.reverseGet);
    };
    /** view an Iso as a Optional */
    Iso.prototype.asOptional = function () {
        var _this = this;
        return new Optional(function (s) { return Either_1.right(_this.get(s)); }, function (a) { return function (_) { return _this.reverseGet(a); }; });
    };
    /** view an Iso as a Traversal */
    Iso.prototype.asTraversal = function () {
        var _this = this;
        return new Traversal(function (F) { return function (f) { return function (s) {
            return F.map(f(_this.get(s)), function (a) { return _this.reverseGet(a); });
        }; }; });
    };
    /** view an Iso as a Fold */
    Iso.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (_) { return function (f) { return function (s) { return f(_this.get(s)); }; }; });
    };
    /** view an Iso as a Getter */
    Iso.prototype.asGetter = function () {
        var _this = this;
        return new Getter(function (s) { return _this.get(s); });
    };
    /** view an Iso as a Setter */
    Iso.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /** compose an Iso with an Iso */
    Iso.prototype.compose = function (ac) {
        var _this = this;
        return new Iso(function (s) { return ac.get(_this.get(s)); }, function (b) { return _this.reverseGet(ac.reverseGet(b)); });
    };
    /** @alias of `compose` */
    Iso.prototype.composeIso = function (ac) {
        return this.compose(ac);
    };
    /** compose an Iso with a Lens */
    Iso.prototype.composeLens = function (ac) {
        return this.asLens().compose(ac);
    };
    /** compose an Iso with a Prism */
    Iso.prototype.composePrism = function (ac) {
        return this.asPrism().compose(ac);
    };
    /** compose an Iso with an Optional */
    Iso.prototype.composeOptional = function (ac) {
        return this.asOptional().compose(ac);
    };
    /** compose an Iso with a Traversal */
    Iso.prototype.composeTraversal = function (ac) {
        return this.asTraversal().compose(ac);
    };
    /** compose an Iso with a Fold */
    Iso.prototype.composeFold = function (ac) {
        return this.asFold().compose(ac);
    };
    /** compose an Iso with a Getter */
    Iso.prototype.composeGetter = function (ac) {
        return this.asGetter().compose(ac);
    };
    /** compose an Iso with a Setter */
    Iso.prototype.composeSetter = function (ac) {
        return this.asSetter().compose(ac);
    };
    return Iso;
}());
exports.Iso = Iso;
function lensFromPath(path) {
    var lens = Lens.fromProp(path[0]);
    return path.slice(1).reduce(function (acc, prop) { return acc.compose(Lens.fromProp(prop)); }, lens);
}
function lensFromProp(prop) {
    return new Lens(function (s) { return s[prop]; }, function (a) { return function (s) { return exports.update(s, prop, a); }; });
}
function lensFromNullableProp(k, defaultValue) {
    return new Lens(function (s) { return Option_1.fromNullable(s[k]).getOrElse(defaultValue); }, function (a) { return function (s) { return exports.update(s, k, a); }; });
}
/*
  Laws:
  1. get(set(a)(s)) = a
  2. set(get(s))(s) = s
  3. set(a)(set(a)(s)) = set(a)(s)
*/
var Lens = /** @class */ (function () {
    function Lens(get, set) {
        this.get = get;
        this.set = set;
        this._tag = 'Lens';
    }
    Lens.fromPath = function () {
        return arguments.length === 0 ? lensFromPath : lensFromPath(arguments[0]);
    };
    Lens.fromProp = function () {
        return arguments.length === 0 ? lensFromProp : lensFromProp(arguments[0]);
    };
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
    Lens.fromProps = function () {
        return function (props) {
            var len = props.length;
            return new Lens(function (s) {
                var r = {};
                for (var i = 0; i < len; i++) {
                    var k = props[i];
                    r[k] = s[k];
                }
                return r;
            }, function (a) { return function (s) {
                for (var i = 0; i < len; i++) {
                    var k = props[i];
                    if (a[k] !== s[k]) {
                        return Object.assign({}, s, a);
                    }
                }
                return s;
            }; });
        };
    };
    Lens.fromNullableProp = function () {
        return arguments.length === 0
            ? lensFromNullableProp
            : lensFromNullableProp(arguments[0], arguments[1]);
    };
    Lens.prototype.modify = function (f) {
        var _this = this;
        return function (s) { return _this.set(f(_this.get(s)))(s); };
    };
    /** view a Lens as a Optional */
    Lens.prototype.asOptional = function () {
        var _this = this;
        return new Optional(function (s) { return Either_1.right(_this.get(s)); }, this.set);
    };
    /** view a Lens as a Traversal */
    Lens.prototype.asTraversal = function () {
        var _this = this;
        return new Traversal(function (F) { return function (f) { return function (s) {
            return F.map(f(_this.get(s)), function (a) { return _this.set(a)(s); });
        }; }; });
    };
    /** view a Lens as a Setter */
    Lens.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /** view a Lens as a Getter */
    Lens.prototype.asGetter = function () {
        var _this = this;
        return new Getter(function (s) { return _this.get(s); });
    };
    /** view a Lens as a Fold */
    Lens.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (_) { return function (f) { return function (s) { return f(_this.get(s)); }; }; });
    };
    /** compose a Lens with a Lens */
    Lens.prototype.compose = function (ac) {
        var _this = this;
        return new Lens(function (s) { return ac.get(_this.get(s)); }, function (b) { return function (s) { return _this.set(ac.set(b)(_this.get(s)))(s); }; });
    };
    /** @alias of `compose` */
    Lens.prototype.composeLens = function (ac) {
        return this.compose(ac);
    };
    /** compose a Lens with a Getter */
    Lens.prototype.composeGetter = function (ab) {
        return this.asGetter().compose(ab);
    };
    /** compose a Lens with a Fold */
    Lens.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /** compose a Lens with an Optional */
    Lens.prototype.composeOptional = function (ac) {
        return this.asOptional().compose(ac);
    };
    /** compose a Lens with an Traversal */
    Lens.prototype.composeTraversal = function (ac) {
        return this.asTraversal().compose(ac);
    };
    /** compose a Lens with an Setter */
    Lens.prototype.composeSetter = function (ac) {
        return this.asSetter().compose(ac);
    };
    /** compose a Lens with an Iso */
    Lens.prototype.composeIso = function (ac) {
        return this.compose(ac.asLens());
    };
    /** compose a Lens with a Prism */
    Lens.prototype.composePrism = function (ac) {
        return this.asOptional().compose(ac.asOptional());
    };
    return Lens;
}());
exports.Lens = Lens;
/*
  Laws:
  1. getOption(s).fold(s, reverseGet) = s
  2. getOption(reverseGet(a)) = Some(a)
*/
var Prism = /** @class */ (function () {
    function Prism(getOrModify, reverseGet) {
        this.getOrModify = getOrModify;
        this.reverseGet = reverseGet;
        this._tag = 'Prism';
    }
    Prism.fromPredicate = function (predicate) {
        return new Prism(function (s) { return (predicate(s) ? Either_1.right(s) : Either_1.left(s)); }, function_1.identity);
    };
    /**
     * Use `fromPredicate` instead
     * @deprecated
     */
    Prism.fromRefinement = function (refinement) {
        return new Prism(function (s) { return (refinement(s) ? Either_1.right(s) : Either_1.left(s)); }, function_1.identity);
    };
    Prism.some = function () {
        return somePrism;
    };
    Prism.prototype.getOption = function (s) {
        return this.getOrModify(s).fold(function_1.constant(Option_1.none), Option_1.some);
    };
    Prism.prototype.modify = function (f) {
        var _this = this;
        return function (s) { return _this.getOrModify(s).fold(function_1.identity, function (v) { return _this.reverseGet(f(v)); }); };
    };
    Prism.prototype.modifyOption = function (f) {
        var _this = this;
        return function (s) { return _this.getOption(s).map(function (v) { return _this.reverseGet(f(v)); }); };
    };
    /** set the target of a Prism with a value */
    Prism.prototype.set = function (b) {
        return this.modify(function () { return b; });
    };
    /** view a Prism as a Optional */
    Prism.prototype.asOptional = function () {
        var _this = this;
        return new Optional(this.getOrModify, function (b) { return _this.set(b); });
    };
    /** view a Prism as a Traversal */
    Prism.prototype.asTraversal = function () {
        var _this = this;
        return new Traversal(function (F) { return function (f) { return function (s) {
            return _this.getOrModify(s).fold(F.of, function (a) { return F.map(f(a), function (b) { return _this.set(b)(s); }); });
        }; }; });
    };
    /** view a Prism as a Setter */
    Prism.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /** view a Prism as a Fold */
    Prism.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (M) { return function (f) { return function (s) { return _this.getOption(s).fold(M.empty, f); }; }; });
    };
    /** compose a Prism with a Prism */
    Prism.prototype.compose = function (ac) {
        var _this = this;
        return new Prism(function (s) { return _this.getOrModify(s).chain(function (a) { return ac.getOrModify(a).bimap(function (b) { return _this.set(b)(s); }, function_1.identity); }); }, function (b) { return _this.reverseGet(ac.reverseGet(b)); });
    };
    /** @alias of `compose` */
    Prism.prototype.composePrism = function (ac) {
        return this.compose(ac);
    };
    /** compose a Prism with a Optional */
    Prism.prototype.composeOptional = function (ac) {
        return this.asOptional().compose(ac);
    };
    /** compose a Prism with a Traversal */
    Prism.prototype.composeTraversal = function (ac) {
        return this.asTraversal().compose(ac);
    };
    /** compose a Prism with a Fold */
    Prism.prototype.composeFold = function (ac) {
        return this.asFold().compose(ac);
    };
    /** compose a Prism with a Setter */
    Prism.prototype.composeSetter = function (ac) {
        return this.asSetter().compose(ac);
    };
    /** compose a Prism with a Iso */
    Prism.prototype.composeIso = function (ac) {
        return this.compose(ac.asPrism());
    };
    /** compose a Prism with a Lens */
    Prism.prototype.composeLens = function (ac) {
        return this.asOptional().compose(ac.asOptional());
    };
    /** compose a Prism with a Getter */
    Prism.prototype.composeGetter = function (ac) {
        return this.asFold().compose(ac.asFold());
    };
    return Prism;
}());
exports.Prism = Prism;
var somePrism = new Prism(function (s) { return s.foldL(function () { return Either_1.left(Option_1.none); }, Either_1.right); }, Option_1.some);
function optionalFromNullableProp(k) {
    return new Optional(function (s) { return Option_1.fromNullable(s[k]).foldL(function () { return Either_1.left(s); }, Either_1.right); }, function (a) { return function (s) { return exports.update(s, k, a); }; });
}
function optionalFromOptionProp(k) {
    return lensFromProp(k).composePrism(somePrism);
}
/*
  Laws:
  1. getOption(s).fold(() => s, a => set(a)(s)) = s
  2. getOption(set(a)(s)) = getOption(s).map(_ => a)
  3. set(a)(set(a)(s)) = set(a)(s)
*/
var Optional = /** @class */ (function () {
    function Optional(getOrModify, set) {
        this.getOrModify = getOrModify;
        this.set = set;
        this._tag = 'Optional';
    }
    Optional.fromNullableProp = function () {
        return arguments.length === 0 ? optionalFromNullableProp : optionalFromNullableProp(arguments[0]);
    };
    Optional.fromOptionProp = function () {
        return arguments.length === 0 ? optionalFromOptionProp : optionalFromOptionProp(arguments[0]);
    };
    Optional.prototype.getOption = function (s) {
        return this.getOrModify(s).fold(function_1.constant(Option_1.none), Option_1.some);
    };
    Optional.prototype.modify = function (f) {
        var _this = this;
        return function (s) { return _this.getOrModify(s).fold(function_1.identity, function (v) { return _this.set(f(v))(s); }); };
    };
    Optional.prototype.modifyOption = function (f) {
        var _this = this;
        return function (s) { return _this.getOption(s).map(function (a) { return _this.set(f(a))(s); }); };
    };
    /** view a Optional as a Traversal */
    Optional.prototype.asTraversal = function () {
        var _this = this;
        return new Traversal(function (F) { return function (f) { return function (s) {
            return _this.getOrModify(s).fold(F.of, function (a) { return F.map(f(a), function (b) { return _this.set(b)(s); }); });
        }; }; });
    };
    /** view an Optional as a Fold */
    Optional.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (M) { return function (f) { return function (s) { return _this.getOption(s).fold(M.empty, f); }; }; });
    };
    /** view an Optional as a Setter */
    Optional.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /** compose a Optional with a Optional */
    Optional.prototype.compose = function (ac) {
        var _this = this;
        return new Optional(function (s) { return _this.getOrModify(s).chain(function (a) { return ac.getOrModify(a).bimap(function (b) { return _this.set(b)(s); }, function_1.identity); }); }, function (b) { return _this.modify(ac.set(b)); });
    };
    /** @alias of `compose` */
    Optional.prototype.composeOptional = function (ac) {
        return this.compose(ac);
    };
    /** compose an Optional with a Traversal */
    Optional.prototype.composeTraversal = function (ac) {
        return this.asTraversal().compose(ac);
    };
    /** compose an Optional with a Fold */
    Optional.prototype.composeFold = function (ac) {
        return this.asFold().compose(ac);
    };
    /** compose an Optional with a Setter */
    Optional.prototype.composeSetter = function (ac) {
        return this.asSetter().compose(ac);
    };
    /** compose an Optional with a Lens */
    Optional.prototype.composeLens = function (ac) {
        return this.compose(ac.asOptional());
    };
    /** compose an Optional with a Prism */
    Optional.prototype.composePrism = function (ac) {
        return this.compose(ac.asOptional());
    };
    /** compose an Optional with a Iso */
    Optional.prototype.composeIso = function (ac) {
        return this.compose(ac.asOptional());
    };
    /** compose an Optional with a Getter */
    Optional.prototype.composeGetter = function (ac) {
        return this.asFold().compose(ac.asFold());
    };
    return Optional;
}());
exports.Optional = Optional;
var Traversal = /** @class */ (function () {
    function Traversal(
    // Van Laarhoven representation
    modifyF) {
        this.modifyF = modifyF;
        this._tag = 'Traversal';
    }
    Traversal.prototype.modify = function (f) {
        var _this = this;
        return function (s) { return _this.modifyF(Identity_1.identity)(function (a) { return Identity_1.identity.of(f(a)); })(s).extract(); };
    };
    Traversal.prototype.set = function (b) {
        return this.modify(function_1.constant(b));
    };
    Traversal.prototype.filter = function (predicate) {
        return this.composePrism(Prism.fromPredicate(predicate));
    };
    /** view a Traversal as a Fold */
    Traversal.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (M) { return function (f) { return function (s) {
            return _this.modifyF(Const_1.getApplicative(M))(function (a) { return new Const_1.Const(f(a)); })(s).fold(function_1.identity);
        }; }; });
    };
    /** view a Traversal as a Setter */
    Traversal.prototype.asSetter = function () {
        var _this = this;
        return new Setter(function (f) { return _this.modify(f); });
    };
    /** compose a Traversal with a Traversal */
    Traversal.prototype.compose = function (ac) {
        var _this = this;
        return new Traversal(function (F) { return function (f) {
            return _this.modifyF(F)(ac.modifyF(F)(f));
        }; });
    };
    /** @alias of `compose` */
    Traversal.prototype.composeTraversal = function (ac) {
        return this.compose(ac);
    };
    /** compose a Traversal with a Fold */
    Traversal.prototype.composeFold = function (ac) {
        return this.asFold().compose(ac);
    };
    /** compose a Traversal with a Setter */
    Traversal.prototype.composeSetter = function (ac) {
        return this.asSetter().compose(ac);
    };
    /** compose a Traversal with a Optional */
    Traversal.prototype.composeOptional = function (ac) {
        return this.compose(ac.asTraversal());
    };
    /** compose a Traversal with a Lens */
    Traversal.prototype.composeLens = function (ac) {
        return this.compose(ac.asTraversal());
    };
    /** compose a Traversal with a Prism */
    Traversal.prototype.composePrism = function (ac) {
        return this.compose(ac.asTraversal());
    };
    /** compose a Traversal with a Iso */
    Traversal.prototype.composeIso = function (ab) {
        return this.compose(ab.asTraversal());
    };
    /** compose a Traversal with a Getter */
    Traversal.prototype.composeGetter = function (ac) {
        return this.asFold().compose(ac.asFold());
    };
    return Traversal;
}());
exports.Traversal = Traversal;
var At = /** @class */ (function () {
    function At(at) {
        this.at = at;
        this._tag = 'At';
    }
    /** lift an instance of `At` using an `Iso` */
    At.prototype.fromIso = function (iso) {
        var _this = this;
        return new At(function (i) { return iso.composeLens(_this.at(i)); });
    };
    return At;
}());
exports.At = At;
var Index = /** @class */ (function () {
    function Index(index) {
        this.index = index;
        this._tag = 'Index';
    }
    Index.fromAt = function (at) {
        return new Index(function (i) { return at.at(i).composePrism(Prism.some()); });
    };
    /** lift an instance of `Index` using an `Iso` */
    Index.prototype.fromIso = function (iso) {
        var _this = this;
        return new Index(function (i) { return iso.composeOptional(_this.index(i)); });
    };
    return Index;
}());
exports.Index = Index;
var Getter = /** @class */ (function () {
    function Getter(get) {
        this.get = get;
        this._tag = 'Getter';
    }
    /** view a Getter as a Fold */
    Getter.prototype.asFold = function () {
        var _this = this;
        return new Fold(function (_) { return function (f) { return function (s) { return f(_this.get(s)); }; }; });
    };
    /** compose a Getter with a Getter */
    Getter.prototype.compose = function (ab) {
        var _this = this;
        return new Getter(function (s) { return ab.get(_this.get(s)); });
    };
    /** @alias of `compose` */
    Getter.prototype.composeGetter = function (ab) {
        return this.compose(ab);
    };
    /** compose a Getter with a Fold */
    Getter.prototype.composeFold = function (ab) {
        return this.asFold().compose(ab);
    };
    /** compose a Getter with a Lens */
    Getter.prototype.composeLens = function (ab) {
        return this.compose(ab.asGetter());
    };
    /** compose a Getter with a Iso */
    Getter.prototype.composeIso = function (ab) {
        return this.compose(ab.asGetter());
    };
    /** compose a Getter with a Optional */
    Getter.prototype.composeTraversal = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    /** compose a Getter with a Optional */
    Getter.prototype.composeOptional = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    /** compose a Getter with a Prism */
    Getter.prototype.composePrism = function (ab) {
        return this.asFold().compose(ab.asFold());
    };
    return Getter;
}());
exports.Getter = Getter;
var Fold = /** @class */ (function () {
    function Fold(foldMap) {
        this.foldMap = foldMap;
        this._tag = 'Fold';
        this.getAll = foldMap(Monoid_1.getArrayMonoid())(function (a) { return [a]; });
        this.exist = foldMap(Monoid_1.monoidAny);
        this.all = foldMap(Monoid_1.monoidAll);
        this.foldMapFirst = foldMap(Option_1.getFirstMonoid());
    }
    /** compose a Fold with a Fold */
    Fold.prototype.compose = function (ab) {
        var _this = this;
        return new Fold(function (M) { return function (f) { return _this.foldMap(M)(ab.foldMap(M)(f)); }; });
    };
    /** @alias of `compose` */
    Fold.prototype.composeFold = function (ab) {
        return this.compose(ab);
    };
    /** compose a Fold with a Getter */
    Fold.prototype.composeGetter = function (ab) {
        return this.compose(ab.asFold());
    };
    /** compose a Fold with a Traversal */
    Fold.prototype.composeTraversal = function (ab) {
        return this.compose(ab.asFold());
    };
    /** compose a Fold with a Optional */
    Fold.prototype.composeOptional = function (ab) {
        return this.compose(ab.asFold());
    };
    /** compose a Fold with a Lens */
    Fold.prototype.composeLens = function (ab) {
        return this.compose(ab.asFold());
    };
    /** compose a Fold with a Prism */
    Fold.prototype.composePrism = function (ab) {
        return this.compose(ab.asFold());
    };
    /** compose a Fold with a Iso */
    Fold.prototype.composeIso = function (ab) {
        return this.compose(ab.asFold());
    };
    Fold.prototype.find = function (p) {
        return this.foldMapFirst(Option_1.fromPredicate(p));
    };
    /** get the first target of a Fold */
    Fold.prototype.headOption = function (s) {
        return this.find(function () { return true; })(s);
    };
    return Fold;
}());
exports.Fold = Fold;
var Setter = /** @class */ (function () {
    function Setter(modify) {
        this.modify = modify;
        this._tag = 'Setter';
    }
    Setter.prototype.set = function (b) {
        return this.modify(function_1.constant(b));
    };
    /** compose a Setter with a Setter */
    Setter.prototype.compose = function (ac) {
        var _this = this;
        return new Setter(function (f) { return _this.modify(ac.modify(f)); });
    };
    /** @alias of `compose` */
    Setter.prototype.composeSetter = function (ac) {
        return this.compose(ac);
    };
    /** compose a Setter with a Traversal */
    Setter.prototype.composeTraversal = function (ac) {
        return this.compose(ac.asSetter());
    };
    /** compose a Setter with a Optional */
    Setter.prototype.composeOptional = function (ac) {
        return this.compose(ac.asSetter());
    };
    /** compose a Setter with a Lens */
    Setter.prototype.composeLens = function (ac) {
        return this.compose(ac.asSetter());
    };
    /** compose a Setter with a Prism */
    Setter.prototype.composePrism = function (ac) {
        return this.compose(ac.asSetter());
    };
    /** compose a Setter with a Iso */
    Setter.prototype.composeIso = function (ac) {
        return this.compose(ac.asSetter());
    };
    return Setter;
}());
exports.Setter = Setter;
// tslint:disable-next-line: deprecation
function fromTraversable(T) {
    return function () {
        return new Traversal(function (F) {
            var traverseF = T.traverse(F);
            return function (f) { return function (s) { return traverseF(s, f); }; };
        });
    };
}
exports.fromTraversable = fromTraversable;
// tslint:disable-next-line: deprecation
function fromFoldable(F) {
    return function () {
        return new Fold(function (M) {
            var foldMapFM = Foldable_1.foldMap(F, M);
            return function (f) { return function (s) { return foldMapFM(s, f); }; };
        });
    };
}
exports.fromFoldable = fromFoldable;
