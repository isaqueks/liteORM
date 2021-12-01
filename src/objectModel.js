"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectModel {
    constructor(fields) {
        this.fields = new Map();
        for (const field of fields) {
            if (this.fields.has(field.name)) {
                throw new Error(`Duplicate field name: ${field.name}`);
            }
            this.fields.set(field.name, field);
        }
    }
    getField(name) {
        if (!this.fields.has(name)) {
            return null;
        }
        return this.fields.get(name);
    }
    getFieldArray() {
        return Array.from(this.fields.values());
    }
}
exports.default = ObjectModel;
