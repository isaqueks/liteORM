import Crud from "../crud";
import VirtualType, { JSPrimaryType } from "../virtualType";
export default class LinkVirtualType<T extends object> extends VirtualType<T, any> {
    private pkPropName;
    private pkType;
    private foreignCrud;
    constructor(pkPropName: string, pkSQLType: string, pkJSType: JSPrimaryType, foreignCrud: Crud<T>);
    protected inputHandler(data: T): any;
    protected outputHandler(data: any): Promise<T>;
}
