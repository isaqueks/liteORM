import Field from "./field";
import ObjectModel from "./objectModel";
import ValuableField from "./valuableField";


class ObjectData extends ObjectModel {

    constructor(fields: ValuableField[]) {
        super(fields);
    }

    static from(model: ObjectModel, data: any): ObjectData {

        let vFields: ValuableField[] = [];
        for (let field of model.getFieldArray()) {
            const value = data[field.name];
            if (value === undefined) {
                continue;
            }
            vFields.push(
                new ValuableField(field.name, field.sqlType, field.sqlAttributes, value)
            );
        }

        return new ObjectData(vFields);
    }

    as<T>(constructor: (new () => T) = undefined) {

        let jsObject: any = {};
        if (constructor) {
            jsObject = new constructor();
        }
        for (let field of this.getFieldArray()) {
            const vField = field as ValuableField;
            jsObject[vField.name] = vField.get();
        }
        return jsObject as T;
    }

}

export default ObjectData;