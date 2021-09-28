import Field from "./field";
import VirtualType from "./virtualType";
declare class ValuableField extends Field {
    value: any;
    set(value: any): void;
    get<T>(): T;
    constructor(name: string, sqlType: string | VirtualType<any, any>, attributes?: string[], value?: any);
}
export default ValuableField;
