"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var S = require("fp-ts/lib/Set");
function atSet(setoid) {
    // tslint:disable-next-line: deprecation
    var member = S.member(setoid);
    var insert = S.insert(setoid);
    var remove = S.remove(setoid);
    return new index_1.At(function (at) { return new index_1.Lens(function (s) { return member(s)(at); }, function (a) { return function (s) { return (a ? insert(at, s) : remove(at, s)); }; }); });
}
exports.atSet = atSet;
