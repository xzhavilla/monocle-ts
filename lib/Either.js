"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("fp-ts/lib/Either");
var Option_1 = require("fp-ts/lib/Option");
var _1 = require(".");
var r = new _1.Prism(Option_1.fromEither, Either_1.right);
exports._right = function () { return r; };
var l = new _1.Prism(function (e) { return e.fold(Option_1.some, function () { return Option_1.none; }); }, Either_1.left);
exports._left = function () { return l; };
