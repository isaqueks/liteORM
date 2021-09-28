import VirtualType from "./virtualType";
declare class Field {
    name: string;
    sqlType: string | VirtualType<any, any>;
    sqlAttributes: string[];
    constructor(name: string, sqlType: string | VirtualType<any, any>, attributes?: string[]);
    /**
     * @param nameSqlTypePair key pair dictionary of fieldName: sqlType
     * @returns Field[]
     */
    static arrayFromDictionary(nameSqlTypePair: any): Field[];
}
export default Field;
