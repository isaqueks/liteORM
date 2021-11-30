"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const powersql_1 = require("powersql");
const virtualType_1 = __importDefault(require("./virtualType"));
class Crud {
    constructor(database, model, tableName) {
        this._database = database;
        this._model = model;
        this._table = this.buildPowerSQLTable(tableName);
    }
    // #region Getters and Setters
    /**
     * The data model
     */
    get model() {
        return this._model;
    }
    /**
     * The database to store/retreive data
     */
    get database() {
        return this._database;
    }
    set database(value) {
        this._database = value;
    }
    /**
     * The table built based on the model
     */
    get table() {
        return this._table;
    }
    // #endregion
    buildPowerSQLTable(tableName) {
        const columns = [];
        for (const field of this.model.fields) {
            let sqlType = field.sqlType;
            if (typeof sqlType === 'object') {
                const vType = sqlType;
                // It is an object. Let's assume it's a VirtualType,
                // but let's check first
                if (virtualType_1.default.isVirtualType(vType)) {
                    sqlType = vType.outputSQLType;
                }
                else {
                    throw new Error(`Field type should be a plain SQL type or a VirtualType! Got "${vType}" (${typeof vType}).`);
                }
            }
            columns.push(new powersql_1.PowerSQLTableColumn(field.name, sqlType, field.sqlAttributes));
        }
        return new powersql_1.PowerSQLTable(tableName, columns);
    }
    /**
     * Creates the table (if not exists)
     */
    createTableIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._database.promise(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.createTable(this._table, true)));
        });
    }
}
exports.default = Crud;
