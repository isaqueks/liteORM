"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VTYPE_SIGNATURE_PROP = exports.VTYPE_SIGNATURE = void 0;
exports.VTYPE_SIGNATURE = 'IS_A_VTYPE';
exports.VTYPE_SIGNATURE_PROP = '__vtype_signature';
class VirtualType {
    constructor(outSQLType, outJSType, inputJSType) {
        this._outputSQLType = outSQLType;
        this._outputJSType = outJSType;
        this._inputJSType = inputJSType;
        this[exports.VTYPE_SIGNATURE_PROP] = exports.VTYPE_SIGNATURE;
    }
    static isVirtualType(runtimeObject) {
        return runtimeObject && typeof runtimeObject === 'object' && runtimeObject[exports.VTYPE_SIGNATURE_PROP] === exports.VTYPE_SIGNATURE;
    }
    get outputSQLType() {
        return this._outputSQLType;
    }
    get outputJSType() {
        return this._outputJSType;
    }
    get inputJSType() {
        return this._inputJSType;
    }
    checkType(data, expectedType) {
        if (typeof data !== expectedType) {
            throw new Error(`Error! Data type should be "${expectedType}". Got "${typeof data}" (${String(data)}).`);
        }
    }
    handleInput(data) {
        this.checkType(data, this._inputJSType);
        return this.inputHandler(data);
    }
    handleOutput(data) {
        this.checkType(data, this._outputJSType);
        return this.outputHandler(data);
    }
}
exports.default = VirtualType;
