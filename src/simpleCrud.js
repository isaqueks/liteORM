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
const nameCheck_1 = __importDefault(require("./nameCheck"));
const sqlCrud_1 = __importDefault(require("./sqlCrud"));
const virtualType_1 = __importDefault(require("./virtualType"));
class SimpleCrud extends sqlCrud_1.default {
    // #endregion
    constructor(database, model, tableName, inputHandler, outputHandler) {
        super();
        this._database = database;
        this._model = model;
        this._table = this.buildPowerSQLTable(tableName);
        this._inputHandler = inputHandler;
        this._outputHandler = outputHandler;
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
        if (!(0, nameCheck_1.default)(tableName)) {
            throw new Error(`Invalid table name: ${tableName}`);
        }
        const columns = [];
        for (const field of this.model.getFieldArray()) {
            let sqlType = field.sqlType;
            if (typeof sqlType === 'object') {
                const vType = sqlType;
                // It is an object. Let's assume it's a VirtualType,
                // but let's check first= {k: v for k, v in sorted(idAccess.items(), key=lambda item: -
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
     * @deprecated Use setup() instead
     */
    createTableIfNotExists() {
        return this.setup();
    }
    /**
     * Creates the table
     */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._database.promise(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.createTable(this._table, true)));
        });
    }
    // #region Getters
    get inputHandler() {
        return this._inputHandler;
    }
    get outputHandler() {
        return this._outputHandler;
    }
    getWhereQuery(searchKeys, joint = 'AND') {
        const whereConditions = [];
        const params = [];
        for (let columnName in searchKeys) {
            const columnValue = searchKeys[columnName];
            const column = this.table.getColumn(columnName);
            if (!column) {
                throw new Error(`Column "${columnName}" does not exists at table ${this.table.name}!`);
            }
            const statement = powersql_1.PowerSQLDefaults.equal(column.name, columnValue);
            whereConditions.push(statement[0]);
            params.push(...statement[1]);
        }
        return [whereConditions.join(` ${joint} `), params];
    }
    removePK(data) {
        const copy = new Object();
        for (const field of this.model.getFieldArray()) {
            if (field.sqlAttributes.includes('PRIMARY KEY') || field.sqlAttributes.includes('PRIMARY_KEY')) {
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(data, field.name)) {
                copy[field.name] = data[field.name];
            }
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
    handleOutput(dbItem) {
        return __awaiter(this, void 0, void 0, function* () {
            dbItem = Object.assign({}, dbItem);
            // Do virtual type output stuff
            for (const field of this.model.getFieldArray()) {
                if (virtualType_1.default.isVirtualType(field.sqlType)) {
                    const vtype = field.sqlType;
                    dbItem[field.name] = yield vtype.handleOutput(dbItem[field.name]);
                }
            }
            if (this._outputHandler) {
                dbItem = yield this._outputHandler(dbItem);
            }
            return dbItem;
        });
    }
    filterColumns(data) {
        const filtered = {};
        for (const field of this.model.getFieldArray()) {
            if (Object.prototype.hasOwnProperty.call(data, field.name)) {
                filtered[field.name] = data[field.name];
            }
        }
        return filtered;
    }
    handleInput(item) {
        return __awaiter(this, void 0, void 0, function* () {
            item = Object.assign({}, item);
            if (this._inputHandler) {
                item = yield this._inputHandler(item);
            }
            // Do virtual type output stuff
            for (const field of this.model.getFieldArray()) {
                if (virtualType_1.default.isVirtualType(field.sqlType)) {
                    const vtype = field.sqlType;
                    item[field.name] = yield vtype.handleInput(item[field.name]);
                }
            }
            // Now, let's filter the values
            // and get only the fields defined in the model
            return this.filterColumns(item);
        });
    }
    query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.database.promise(sql, params);
            if (!Array.isArray(data)) {
                if (data) {
                    throw new Error(`Invalid data received: ${JSON.stringify(data)}`);
                }
                return null;
            }
            return yield Promise.all(data.map((singleData) => this.handleOutput(singleData)));
        });
    }
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            data = this.removePK(data);
            data = yield this.handleInput(data);
            return yield this.database.promise(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.insertInto(this.table, data)));
        });
    }
    get(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataArray = yield this.query(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.selectWhere(this.table, searchKeys), 'LIMIT 1'));
            if (!dataArray) {
                return null;
            }
            return dataArray[0];
        });
    }
    update(searchKeys, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            dataToUpdate = yield this.handleInput(dataToUpdate);
            const where = this.getWhereQuery(searchKeys);
            return yield this.database.promise(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.update(this.table), powersql_1.PowerSQLDefaults.set(dataToUpdate), powersql_1.PowerSQLDefaults.where(where)));
        });
    }
    delete(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const filtered = this.filterColumns(searchKeys);
            const where = this.getWhereQuery(filtered);
            return yield this.database.promise(...(0, powersql_1.PowerSQL)('DELETE', powersql_1.PowerSQLDefaults.from(this.table), powersql_1.PowerSQLDefaults.where(where)));
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
            const dataArray = yield this.query(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.selectWhere(this.table, searchKeys)));
            if (!dataArray) {
                return [];
            }
            return dataArray;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.query(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.select('*'), powersql_1.PowerSQLDefaults.from(this.table)));
        });
    }
    search(search) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = [];
            const params = [];
            for (const term of search) {
                if (typeof term === 'string') {
                    query.push(term);
                }
                else if (typeof term === 'object') {
                    const searchCond = term;
                    const searchField = Object.keys(searchCond)[0];
                    const field = this.model.getField(searchField);
                    if (!field) {
                        throw new Error(`Column "${searchField}" does not exists on table "${this.table.name}".!`);
                    }
                    const searchData = searchCond[searchField];
                    params.push(searchData.value);
                    query.push([
                        searchField,
                        searchData.compare,
                        '?'
                    ].join(' '));
                }
                else {
                    throw new Error(`Unknown search term: ${term}`);
                }
            }
            return yield this.query(...(0, powersql_1.PowerSQL)(powersql_1.PowerSQLDefaults.select('*'), powersql_1.PowerSQLDefaults.from(this.table), powersql_1.PowerSQLDefaults.where([query.join(' '), params])));
        });
    }
    /**
     * @deprecated Use search() instead
     * @param search The SQL search
     * @returns The search result
     */
    deepSearch(search) {
        return this.search(search);
    }
}
exports.default = SimpleCrud;
