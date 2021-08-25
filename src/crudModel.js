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
const objectData_1 = __importDefault(require("./objectData"));
const valuableField_1 = __importDefault(require("./valuableField"));
class CrudModel {
    constructor(database, model, tableName) {
        this.database = database;
        this.model = model;
        this.table = this.getPowerSqltable(tableName);
    }
    getPowerSqltable(tableName) {
        const columns = [];
        for (let field of this.model.fields) {
            columns.push(new powersql_1.PowerSQLTableColumn(field.name, field.sqlType, field.sqlAttributes));
        }
        return new powersql_1.PowerSQLTable(tableName, columns);
    }
    createTableIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.promise(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.createTable(this.table)));
        });
    }
    getMultipleObjectData(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.selectObject(this.table, searchKeys));
            const result = yield this.database.promise(sql);
            if (!result || result.length == 0) {
                return [];
            }
            const resultMultipleObjectData = [];
            for (let objResult of result) {
                const objData = new objectData_1.default([]);
                for (let fieldName in objResult) {
                    const modelField = this.model.getField(fieldName);
                    if (!modelField) {
                        continue;
                    }
                    const value = objResult[fieldName];
                    const vField = new valuableField_1.default(fieldName, modelField.sqlType, modelField.sqlAttributes, value);
                    objData.fields.push(vField);
                }
                resultMultipleObjectData.push(objData);
            }
            return resultMultipleObjectData;
        });
    }
    /**
     * ! Will throw an error if it returns more than one row !
     */
    getSingleObjectData(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.getMultipleObjectData(searchKeys);
            if (result.length == 0) {
                return null;
            }
            if (result.length > 1) {
                throw new Error(`Only one row expected! ${result.length} received!`);
            }
            return result[0];
        });
    }
    getMultiple(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const array = yield this.getMultipleObjectData(searchKeys);
            const multipleData = [];
            array.forEach(item => multipleData.push(item.as()));
            return multipleData;
        });
    }
    get(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const singleData = yield this.getSingleObjectData(searchKeys);
            if (!singleData) {
                return null;
            }
            return singleData.as();
        });
    }
    getModelPrimaryKey() {
        for (let field of this.model.fields) {
            for (let attr of field.sqlAttributes) {
                if (attr.toUpperCase() === 'PRIMARY KEY') {
                    return field;
                }
            }
        }
        return null;
    }
    checkOrRemovePKColumnAndThrowError(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const pk = this.getModelPrimaryKey();
            if (pk) {
                const valuablePkField = data.getField(pk.name);
                if (valuablePkField.get()) {
                    const dataWithPk = yield this.getMultiple({ [pk.name]: valuablePkField.get() });
                    if (dataWithPk.length > 0) {
                        throw new Error(`Could not insert data with PRIMARY KEY field set to ${valuablePkField.get()}`
                            + ` because there is already data with that PK!`);
                    }
                }
                else {
                    data.fields = data.fields.filter(f => f.name !== pk.name);
                }
            }
        });
    }
    insertData(data, checkForDuplicateData = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (checkForDuplicateData) {
                yield this.checkOrRemovePKColumnAndThrowError(data);
            }
            return yield this.database.promise(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.insertInto(this.table, data.as())));
        });
    }
    insertMultipleData(data, checkForDuplicate = true) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let dataObj of data) {
                yield this.insertData(dataObj, checkForDuplicate);
            }
        });
    }
    insert(data, checkForDuplicateData = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.insertData(objectData_1.default.from(this.model, data), checkForDuplicateData);
        });
    }
    insertMultiple(data, checkForDuplicate = true) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let dataObj of data) {
                yield this.insert(dataObj, checkForDuplicate);
            }
        });
    }
    mountWhere(searchKeys) {
        let deleteCond = [];
        for (let key in searchKeys) {
            let field = this.model.getField(key);
            if (!field) {
                continue;
            }
            let value = searchKeys[key];
            deleteCond.push(powersql_1.PowerSQLDefaults.equal(field.name, powersql_1.PowerSQLDefaults.param(value, field.sqlType)));
        }
        return powersql_1.PowerSQLDefaults.where(powersql_1.PowerSQLDefaults.group(deleteCond.join(' AND ')));
    }
    delete(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.promise(powersql_1.PowerSQL('DELETE', powersql_1.PowerSQLDefaults.from(this.table), this.mountWhere(searchKeys)));
        });
    }
    deleteMultiple(searchKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let key of searchKeys) {
                yield this.delete(key);
            }
        });
    }
    deleteExactly(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.delete(item);
        });
    }
    deleteMultipleExactly(items) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let item of items) {
                yield this.deleteExactly(item);
            }
        });
    }
    update(searchKeys, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dataToUpdate) {
                throw new Error('dataToUpdate expected!');
            }
            yield this.database.promise(powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.update(this.table), powersql_1.PowerSQLDefaults.set(dataToUpdate), this.mountWhere(searchKeys)));
        });
    }
    searchData(likeTerms, searchType = 'AND') {
        return __awaiter(this, void 0, void 0, function* () {
            const searchTerms = [];
            for (const propName in likeTerms) {
                const field = this.model.getField(propName);
                if (!field) {
                    continue;
                }
                const propVal = likeTerms[propName];
                searchTerms.push(powersql_1.PowerSQLDefaults.like(propName, powersql_1.PowerSQLDefaults.param(propVal, field.sqlType)));
            }
            const sql = powersql_1.PowerSQL(powersql_1.PowerSQLDefaults.select('*'), powersql_1.PowerSQLDefaults.from(this.table), powersql_1.PowerSQLDefaults.where(searchTerms.join(searchType)));
            const result = yield this.database.promise(sql);
            if (!result || result.length == 0) {
                return [];
            }
            const resultMultipleObjectData = [];
            for (let objResult of result) {
                const objData = new objectData_1.default([]);
                for (let fieldName in objResult) {
                    const modelField = this.model.getField(fieldName);
                    if (!modelField) {
                        continue;
                    }
                    const value = objResult[fieldName];
                    const vField = new valuableField_1.default(fieldName, modelField.sqlType, modelField.sqlAttributes, value);
                    objData.fields.push(vField);
                }
                resultMultipleObjectData.push(objData);
            }
            return resultMultipleObjectData;
        });
    }
    search(likeTerms, searchType = 'AND') {
        return __awaiter(this, void 0, void 0, function* () {
            const array = yield this.searchData(likeTerms, searchType);
            const multipleData = [];
            array.forEach(item => multipleData.push(item.as()));
            return multipleData;
        });
    }
}
exports.default = CrudModel;
