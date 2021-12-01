import checkSQLIdentifierName from "./nameCheck";
import VirtualType from "./virtualType";

class Field {
    name: string;
    sqlType: string | VirtualType<any, any>;
    sqlAttributes: string[];

    constructor(name: string, sqlType: string | VirtualType<any, any>, attributes: string[] = []) {
        if (!name || !sqlType) {
            throw new Error('name, sqlType required!');
        }

        if (!checkSQLIdentifierName(name)) {
            throw new Error(`Invalid field name! "${name}"`);
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
    static arrayFromDictionary(nameSqlTypePair: any): Field[] {
        const arr: Field[] = [];
        for (let fieldName in nameSqlTypePair) {
            const prop: any = nameSqlTypePair[fieldName];
            if (typeof prop === 'string') {
                // Then, prop is sqlType
                arr.push(
                    new Field(fieldName, prop)
                );
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

                arr.push(
                    new Field(fieldName, type, attributes)
                );

            }
            else {
                throw new Error(`String or object expected! Got "${typeof prop}" (${prop})!`);
            }
            
        }
        return arr;
    }
}

export default Field;