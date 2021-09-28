import VirtualType from "../virtualType";
export default class ObjectVirtualType<T extends object> extends VirtualType<T, string> {
    constructor(outputSQLType?: string);
    protected inputHandler(data: T): string;
    protected outputHandler(data: string): T;
}
