"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Field {
    constructor(name, sqlType, attributes = []) {
        if (!name || !sqlType) {
            throw new Error('name, sqlType required!');
        }
        this.name = name;
        this.sqlType = sqlType;
        if (!Array.isArray(attributes)) {
            throw new Error(`string[] expected for attributes! Got ${attributes}`);
        }
        this.sqlAttributes = attributes;
    }
    /**
     * @param nameSqlTypePair key pair dictionary of fieldName: sqlType
     * @returns Field[]
     */
    static arrayFromDictionary(nameSqlTypePair) {
        const arr = [];
        for (let fieldName in nameSqlTypePair) {
            const prop = nameSqlTypePair[fieldName];
            if (typeof prop === 'string') {
                // Then, prop is sqlType
                arr.push(new Field(fieldName, prop));
            }
            else if (typeof prop === 'object') {
                // Object must be a { type: 'sqlType', attributes: string[] }
                const { type, attributes } = prop;
                if (typeof type !== 'string') {
                    throw new Error(`type must be a string! Got "${typeof type}" (${type})!`);
                }
                if (attributes != undefined) {
                    if (!Array.isArray(attributes)) {
                        throw new Error(`Attributes must be an array! Got ${attributes}`);
                    }
                    for (let attr of attributes) {
                        if (typeof attr !== 'string') {
                            throw new Error(`All attributes must be of type string! Got ${typeof attr} (${attr})!`);
                        }
                    }
                }
                arr.push(new Field(fieldName, type, attributes));
            }
            else {
                throw new Error(`String or object expected! Got "${typeof prop}" (${prop})!`);
            }
        }
        return arr;
    }
}
exports.default = Field;
