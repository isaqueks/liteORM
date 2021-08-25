import Field from "./field";

class ObjectModel {
    fields: Field[];

    constructor(fields: Field[]) {
        this.fields = fields;
    }

    getField(name: string): Field | null {
        for (let field of this.fields) {
            if (field.name === name) {
                return field;
            }
        }

        return null;
    }

}

export default ObjectModel;