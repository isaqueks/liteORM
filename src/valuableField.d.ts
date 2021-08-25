import Field from "./field";
declare class ValuableField extends Field {
    value: any;
    set(value: any): void;
    get<T>(): T;
    constructor(name: string, sqlType: string, attributes?: string[], value?: any);
}
export default ValuableField;
