"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secondaryDBPlugin = void 0;
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var mongoose_1 = __importDefault(require("mongoose"));
var path_1 = __importDefault(require("path"));
var customInit_1 = require("./customInit");
var extendWebpackConfig = function (config) { return function (webpackConfig) {
    var _a;
    var _b, _c;
    var existingWebpackConfig = typeof ((_b = config.admin) === null || _b === void 0 ? void 0 : _b.webpack) === 'function'
        ? config.admin.webpack(webpackConfig)
        : webpackConfig;
    return __assign(__assign({}, existingWebpackConfig), { resolve: __assign(__assign({}, (existingWebpackConfig.resolve || {})), { alias: __assign(__assign({}, (((_c = existingWebpackConfig.resolve) === null || _c === void 0 ? void 0 : _c.alias) || {})), (_a = {}, _a[path_1.default.resolve(__dirname, 'customInit')] = path_1.default.resolve(__dirname, './mock.js'), _a)) }) });
}; };
var secondaryDBPlugin = function (_a) {
    var collections = _a.collections, secondDBUrl = _a.secondDBUrl;
    return function (config) { return __awaiter(void 0, void 0, void 0, function () {
        var webpack, defaultAdapterConfig, _i, _a, collection, adapter;
        var _b, _c;
        return __generator(this, function (_d) {
            webpack = extendWebpackConfig(config);
            config = __assign({}, config);
            config.admin = __assign(__assign({}, (config.admin || {})), { webpack: webpack });
            defaultAdapterConfig = config.db;
            for (_i = 0, _a = (_b = config.collections) !== null && _b !== void 0 ? _b : []; _i < _a.length; _i++) {
                collection = _a[_i];
                collection.custom = (_c = collection.custom) !== null && _c !== void 0 ? _c : {};
                if (collections.includes(collection.slug)) {
                    collection.custom.instance = 2;
                }
                else {
                    collection.custom.instance = 1;
                }
            }
            adapter = function (_a) {
                var payload = _a.payload;
                var secondAdapter = (0, db_mongodb_1.mongooseAdapter)({
                    url: secondDBUrl,
                })({ payload: payload });
                var defaultAdapter = defaultAdapterConfig({ payload: payload });
                secondAdapter.payload = payload;
                return new Proxy(defaultAdapter, {
                    get: function (target, p) {
                        if (p === 'init') {
                            return function init() {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _a, client, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                _a = target;
                                                return [4 /*yield*/, mongoose_1.default
                                                        .createConnection(defaultAdapter.url, __assign({ autoIndex: true }, defaultAdapter.connectOptions))
                                                        .asPromise()
                                                    // @ts-expect-error
                                                ];
                                            case 1:
                                                _a.connection = _c.sent();
                                                // @ts-expect-error
                                                mongoose_1.default.model = function () {
                                                    var _a;
                                                    var args = [];
                                                    for (var _i = 0; _i < arguments.length; _i++) {
                                                        args[_i] = arguments[_i];
                                                    }
                                                    // @ts-expect-error
                                                    return (_a = target.connection).model.apply(_a, args);
                                                };
                                                client = target.connection.getClient();
                                                if (!client.options.replicaSet) {
                                                    target.transactionOptions = false;
                                                    target.beginTransaction = undefined;
                                                }
                                                // @ts-expect-error
                                                global.currentInstance = 1;
                                                return [4 /*yield*/, customInit_1.customInit.bind(target)(payload)];
                                            case 2:
                                                _c.sent();
                                                _b = secondAdapter;
                                                return [4 /*yield*/, mongoose_1.default
                                                        .createConnection(secondDBUrl, __assign({ autoIndex: true }, defaultAdapter.connectOptions))
                                                        .asPromise()];
                                            case 3:
                                                _b.connection = _c.sent();
                                                payload.logger.info('Connected to the main database');
                                                // @ts-expect-error
                                                mongoose_1.default.model = function () {
                                                    var _a;
                                                    var args = [];
                                                    for (var _i = 0; _i < arguments.length; _i++) {
                                                        args[_i] = arguments[_i];
                                                    }
                                                    // @ts-expect-error
                                                    return (_a = secondAdapter.connection).model.apply(_a, args);
                                                };
                                                client = secondAdapter.connection.getClient();
                                                if (!client.options.replicaSet) {
                                                    secondAdapter.transactionOptions = false;
                                                    secondAdapter.beginTransaction = undefined;
                                                }
                                                // @ts-expect-error
                                                global.currentInstance = 2;
                                                return [4 /*yield*/, customInit_1.customInit.bind(secondAdapter)(payload)];
                                            case 4:
                                                _c.sent();
                                                payload.logger.info('Connected to the secondary database');
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            };
                        }
                        if (p === 'connect') {
                            return function () { };
                        }
                        // @ts-expect-error
                        var value = target[p];
                        if (typeof value === 'function') {
                            return function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var firstArg = args[0];
                                if (firstArg &&
                                    typeof firstArg === 'object' &&
                                    'collection' in firstArg &&
                                    typeof firstArg.collection === 'string' &&
                                    collections.includes(firstArg.collection)) {
                                    // @ts-expect-error
                                    return Reflect.apply(secondAdapter[p], secondAdapter, args);
                                }
                                // @ts-expect-error
                                var val = target[p].apply(target, args);
                                return val;
                            };
                        }
                        // @ts-expect-error
                        return target[p];
                    },
                });
            };
            config.db = adapter;
            return [2 /*return*/, config];
        });
    }); };
};
exports.secondaryDBPlugin = secondaryDBPlugin;
//# sourceMappingURL=index.js.map