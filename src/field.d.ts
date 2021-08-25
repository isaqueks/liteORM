declare class Field {
    name: string;
    sqlType: string;
    sqlAttributes: string[];
    constructor(name: string, sqlType: string, attributes?: string[]);
    /**
     * @param nameSqlTypePair key pair dictionary of fieldName: sqlType
     * @returns Field[]
     */
    static arrayFromDictionary(nameSqlTypePair: any): Field[];
}
export default Field;
