"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const field_1 = __importDefault(require("./field"));
class ValuableField extends field_1.default {
    constructor(name, sqlType, attributes = [], value = null) {
        super(name, sqlType, attributes);
        this.set(value);
    }
    set(value) {
        this.value = value;
    }
    get() {
        return this.value;
    }
}
exports.default = ValuableField;
