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
Object.defineProperty(exports, "__esModule", { value: true });
const powersql_1 = require("powersql");
class Crud {
    constructor(database, model, tableName) {
        this.database = database;
        this.model = model;
        this.table = this.buildPowerSQLTable(tableName);
    }
    // #region Getters and Setters
    get model() {
        return this._model;
    }
    set model(value) {
        this._model = value;
    }
    get database() {
        return this._database;
    }
    set database(value) {
        this._database = value;
    }
    get table() {
        return this._table;
    }
    set table(value) {
        this._table = value;
    }
    // #endregion
    buildPowerSQLTable(tableName) {
        const columns = [];
        for (let field of this.model.fields) {
            columns.push(new powersql_1.PowerSQLTableColumn(field.name, field.sqlType, field.sqlAttributes));
        }
        return new powersql_1.PowerSQLTable(tableName, columns);
    }
    /**
     * Creates the table (if not exists)
     */
    createTableIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._database.promise(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.createTable(this._table)));
        });
    }
}
exports.default = Crud;
