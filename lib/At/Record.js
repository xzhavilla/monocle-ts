"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var R = require("fp-ts/lib/Record");
function atRecord() {
    return new index_1.At(function (at) { return new index_1.Lens(function (s) { return R.lookup(at, s); }, function (a) { return function (s) { return a.fold(R.remove(at, s), function (x) { return R.insert(at, x, s); }); }; }); });
}
exports.atRecord = atRecord;
