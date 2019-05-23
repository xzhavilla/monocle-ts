"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var Array_1 = require("fp-ts/lib/Array");
function indexArray() {
    // tslint:disable-next-line: deprecation
    return new index_1.Index(function (i) { return new index_1.Optional(function (s) { return Array_1.index(i, s); }, function (a) { return function (s) { return Array_1.updateAt(i, a, s).getOrElse(s); }; }); });
}
exports.indexArray = indexArray;
