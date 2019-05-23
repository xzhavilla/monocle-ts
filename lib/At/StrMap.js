"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var SM = require("fp-ts/lib/StrMap");
function atStrMap() {
    return new index_1.At(function (at) { return new index_1.Lens(function (s) { return SM.lookup(at, s); }, function (a) { return function (s) { return a.fold(SM.remove(at, s), function (x) { return SM.insert(at, x, s); }); }; }); });
}
exports.atStrMap = atStrMap;
