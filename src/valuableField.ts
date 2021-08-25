import Field from "./field";

class ValuableField extends Field {

    value: any;

    set(value: any) {
        this.value = value;
    }

    get<T>(): T {
        return this.value as T;
    }

    constructor(name: string, sqlType: string, attributes: string[] = [], value: any = null) {
        super(name, sqlType, attributes);
        this.set(value);
    }

}

export default ValuableField;