"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const virtualType_1 = __importDefault(require("../virtualType"));
class ObjectVirtualType extends virtualType_1.default {
    constructor(outputSQLType = 'TEXT') {
        super(outputSQLType, 'string', 'object');
    }
    inputHandler(data) {
        return JSON.stringify(data);
    }
    outputHandler(data) {
        return JSON.parse(data);
    }
}
exports.default = ObjectVirtualType;
