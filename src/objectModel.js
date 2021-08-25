"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectModel {
    constructor(fields) {
        this.fields = fields;
    }
    getField(name) {
        for (let field of this.fields) {
            if (field.name === name) {
                return field;
            }
        }
        return null;
    }
}
exports.default = ObjectModel;
