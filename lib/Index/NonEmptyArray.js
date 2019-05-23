"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
function indexNonEmptyArray() {
    // tslint:disable-next-line: deprecation
    return new index_1.Index(function (i) { return new index_1.Optional(function (s) { return s.index(i); }, function (a) { return function (s) { return s.updateAt(i, a).getOrElse(s); }; }); });
}
exports.indexNonEmptyArray = indexNonEmptyArray;
