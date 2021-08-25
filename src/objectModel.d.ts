import Field from "./field";
declare class ObjectModel {
    fields: Field[];
    constructor(fields: Field[]);
    getField(name: string): Field | null;
}
export default ObjectModel;
