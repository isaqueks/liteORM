import Field from "./field";

class ObjectModel {
    fields: Map<string, Field>;

    constructor(fields: Field[]) {
        this.fields = new Map<string, Field>();
        for (const field of fields) {
            if (this.fields.has(field.name)) {
                throw new Error(`Duplicate field name: ${field.name}`);
            }
            this.fields.set(field.name, field);
        }
    }

    getField(name: string): Field | null {
        if (!this.fields.has(name)) {
            return null;
        }
        return this.fields.get(name);
    }

    getFieldArray(): Field[] {
        return Array.from(this.fields.values());
    }

}

export default ObjectModel;