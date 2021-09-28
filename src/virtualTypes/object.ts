import VirtualType from "../virtualType";

export default class ObjectVirtualType<T extends object> extends VirtualType<T, string> {

    constructor(outputSQLType: string = 'TEXT') {
        super(outputSQLType, 'string', 'object');
    }

    protected inputHandler(data: T): string {
        return JSON.stringify(data);
    }
    protected outputHandler(data: string): T {
        return JSON.parse(data);
    }

}