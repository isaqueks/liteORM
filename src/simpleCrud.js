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
const Crud_1 = __importDefault(require("./Crud"));
const x = [{
        name: {
            value: 'John',
            compare: 'LIKE',
        },
    }, 'AND', {}];
class SimpleCrud extends Crud_1.default {
    // #endregion
    constructor(database, model, tableName, inputHandler, outputHandler) {
        super(database, model, tableName);
        this._inputHandler = inputHandler;
        this._outputHandler = outputHandler;
    }
    // #region Getters
    get inputHandler() {
        return this._inputHandler;
    }
    get outputHandler() {
        return this._outputHandler;
    }
    getWhereQuery(searchKeys, joint = 'AND') {
        let whereConditions = [];
        for (let columnName in searchKeys) {
            const columnValue = searchKeys[columnName];
            const column = this.table.getColumn(columnName);
            if (!this.table) {
                throw new Error(`Column "${columnName}" does not exists at table ${this.table.name}!`);
            }
            whereConditions.push(powersql_1.PowerSQLDefaults.equal(column.name, powersql_1.PowerSQLDefaults.param(columnValue, column.type)));
        }
        return whereConditions.join(` ${joint} `);
    }
    removePK(data) {
        const copy = {};
        for (const field of this.model.fields) {
            if (field.sqlAttributes.includes('PRIMARY KEY')) {
                continue;
            }
            copy[field.name] = data[field.name];
        }
        return copy;
    }
    removePKArray(data) {
        const arr = [];
        for (const item of data) {
            arr.push(this.removePK(item));
        }
        return arr;
    }
    query(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.database.promise(sql);
            if (!Array.isArray(data)) {
                if (data) {
                    throw new Error(`Invalid data received: ${JSON.stringify(data)}`);
                }
                return null;
            }
            if (this._outputHandler) {
                data.map((singleData) => {
                    singleData = this._outputHandler(singleData);
                });
            }
            return data;
        });
    }
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            data = this.removePK(data);
            if (this._inputHandler) {
                data = this._inputHandler(data);
            }
            return yield this.database.promise(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.insertInto(this.table, data)));
        });
    }
    get(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataArray = yield this.query(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.selectObject(this.table, searchKeys), 'LIMIT 1'));
            if (!dataArray) {
                return null;
            }
            return dataArray[0];
        });
    }
    update(searchKeys, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = this.getWhereQuery(searchKeys);
            return yield this.database.promise(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.update(this.table), powersql_1.PowerSQLDefaults.set(dataToUpdate), powersql_1.PowerSQLDefaults.where(where)));
        });
    }
    delete(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = this.getWhereQuery(searchKeys);
            return yield this.database.promise(powersql_1.PowerSQL('DELETE', powersql_1.PowerSQLDefaults.from(this.table), powersql_1.PowerSQLDefaults.where(where)));
        });
    }
    insertMultiple(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            for (const item of data) {
                promises.push(this.insert(item));
            }
            yield Promise.all(promises);
        });
    }
    getMultiple(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataArray = yield this.query(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.selectObject(this.table, searchKeys)));
            if (!dataArray) {
                return [];
            }
            return dataArray;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.query(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.select('*'), powersql_1.PowerSQLDefaults.from(this.table)));
        });
    }
    deepSearch(search) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = [];
            for (const term of search) {
                if (typeof term === 'string') {
                    query.push(term);
                }
                else if (typeof term === 'object') {
                    const searchCond = term;
                    const searchField = Object.keys(searchCond)[0];
                    const field = this.model.getField(searchField);
                    if (!field) {
                        throw new Error(`Invalid field "${searchField}"!`);
                    }
                    const searchData = searchCond[searchField];
                    query.push([
                        searchField,
                        searchData.compare,
                        powersql_1.PowerSQLDefaults.param(searchData.value, field.sqlType)
                    ].join(' '));
                }
                else {
                    throw new Error(`Unknown search term: ${term}`);
                }
            }
            return yield this.query(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.select('*'), powersql_1.PowerSQLDefaults.from(this.table), powersql_1.PowerSQLDefaults.where(query.join(' '))));
        });
    }
}
exports.default = SimpleCrud;
