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
exports.customInit = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
var mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
var versions_1 = require("payload/versions");
var buildCollectionSchema_js_1 = __importDefault(require("@payloadcms/db-mongodb/dist/models/buildCollectionSchema.js"));
var buildGlobalModel_js_1 = require("@payloadcms/db-mongodb/dist/models/buildGlobalModel.js");
var buildSchema_1 = __importDefault(require("@payloadcms/db-mongodb/dist/models/buildSchema"));
var buildQuery_1 = __importDefault(require("@payloadcms/db-mongodb/dist/queries/buildQuery"));
var getDBName_1 = require("@payloadcms/db-mongodb/dist/utilities/getDBName");
var customInit = function init() {
    return __awaiter(this, void 0, void 0, function () {
        var model;
        var _this = this;
        return __generator(this, function (_a) {
            this.payload.config.collections.forEach(function (collection) {
                var _a, _b, _c, _d;
                var currentInstance = (_a = global.currentInstance) !== null && _a !== void 0 ? _a : 1;
                if (((_b = collection.custom) === null || _b === void 0 ? void 0 : _b.instance) && collection.custom.instance !== currentInstance) {
                    return;
                }
                var schema = (0, buildCollectionSchema_js_1.default)(collection, _this);
                if (collection.versions) {
                    var versionModelName = (0, getDBName_1.getDBName)({
                        config: collection,
                        versions: true,
                    });
                    var versionCollectionFields = (0, versions_1.buildVersionCollectionFields)(collection);
                    var versionSchema = (0, buildSchema_1.default)(_this, versionCollectionFields, {
                        disableUnique: true,
                        draftsEnabled: true,
                        indexSortableFields: _this.payload.config.indexSortableFields,
                        options: __assign(__assign({ minimize: false, timestamps: false }, _this.schemaOptions), (((_c = _this.collectionOptions[collection.slug]) === null || _c === void 0 ? void 0 : _c.schemaOptions) || {})),
                    });
                    versionSchema.plugin(mongoose_paginate_v2_1.default, { useEstimatedCount: true }).plugin((0, buildQuery_1.default)({
                        collectionSlug: collection.slug,
                        versionsFields: versionCollectionFields,
                    }));
                    if ((_d = collection.versions) === null || _d === void 0 ? void 0 : _d.drafts) {
                        versionSchema.plugin(mongoose_aggregate_paginate_v2_1.default);
                    }
                    var model_1 = mongoose_1.default.model(versionModelName, versionSchema, _this.autoPluralization === true ? undefined : versionModelName);
                    _this.versions[collection.slug] = model_1;
                }
                var model = mongoose_1.default.model((0, getDBName_1.getDBName)({ config: collection }), schema, _this.autoPluralization === true ? undefined : collection.slug);
                _this.collections[collection.slug] = model;
                // TS expect error only needed until we launch 2.0.0
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                _this.payload.collections[collection.slug] = {
                    config: collection,
                };
            });
            model = (0, buildGlobalModel_js_1.buildGlobalModel)(this);
            this.globals = model;
            this.payload.config.globals.forEach(function (global) {
                if (global.versions) {
                    var versionModelName = (0, getDBName_1.getDBName)({ config: global, versions: true });
                    var versionGlobalFields = (0, versions_1.buildVersionGlobalFields)(global);
                    var versionSchema = (0, buildSchema_1.default)(_this, versionGlobalFields, {
                        disableUnique: true,
                        draftsEnabled: true,
                        indexSortableFields: _this.payload.config.indexSortableFields,
                        options: __assign(__assign({ minimize: false, timestamps: false }, _this.schemaOptions), (_this.globalsOptions.schemaOptions || {})),
                    });
                    versionSchema
                        .plugin(mongoose_paginate_v2_1.default, { useEstimatedCount: true })
                        .plugin((0, buildQuery_1.default)({ versionsFields: versionGlobalFields }));
                    var versionsModel = mongoose_1.default.model(versionModelName, versionSchema, versionModelName);
                    _this.versions[global.slug] = versionsModel;
                }
            });
            return [2 /*return*/];
        });
    });
};
exports.customInit = customInit;
//# sourceMappingURL=customInit.js.map