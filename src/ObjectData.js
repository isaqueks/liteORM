"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objectModel_1 = __importDefault(require("./objectModel"));
const valuableField_1 = __importDefault(require("./valuableField"));
class ObjectData extends objectModel_1.default {
    constructor(fields) {
        super(fields);
    }
    static from(model, data) {
        let vFields = [];
        for (let field of model.fields) {
            const value = data[field.name];
            if (value === undefined) {
                continue;
            }
            vFields.push(new valuableField_1.default(field.name, field.sqlType, field.sqlAttributes, value));
        }
        return new ObjectData(vFields);
    }
    as(constructor = undefined) {
        let jsObject = {};
        if (constructor) {
            jsObject = new constructor();
        }
        for (let field of this.fields) {
            const vField = field;
            jsObject[vField.name] = vField.get();
        }
        return jsObject;
    }
}
exports.default = ObjectData;
