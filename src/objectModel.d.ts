import Field from "./field";
declare class ObjectModel {
    fields: Map<string, Field>;
    constructor(fields: Field[]);
    getField(name: string): Field | null;
    getFieldArray(): Field[];
}
export default ObjectModel;
