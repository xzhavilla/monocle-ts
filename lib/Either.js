"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("fp-ts/lib/Either");
var function_1 = require("fp-ts/lib/function");
var _1 = require(".");
var r = new _1.Prism(function_1.identity, Either_1.right);
exports._right = function () { return r; };
var l = new _1.Prism(function (e) { return e.fold(function (l) { return Either_1.right(l); }, function (a) { return Either_1.left(a); }); }, Either_1.left);
exports._left = function () { return l; };
