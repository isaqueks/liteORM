import Field from "./field";
import VirtualType from "./virtualType";

class ValuableField extends Field {

    value: any;

    set(value: any) {
        this.value = value;
    }

    get<T>(): T {
        return this.value as T;
    }

    constructor(name: string, sqlType: string | VirtualType<any, any>, attributes: string[] = [], value: any = null) {
        super(name, sqlType, attributes);
        this.set(value);
    }

}

export default ValuableField;