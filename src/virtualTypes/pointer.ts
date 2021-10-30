import Crud from "../crud";
import VirtualType, { JSPrimaryType } from "../virtualType";

export default class LinkVirtualType<T extends object> extends VirtualType<T, any> {

    private pkPropName: string;
    private pkType: JSPrimaryType;
    private foreignCrud: Crud<T>;

    constructor(
        pkPropName: string = 'id',
        pkSQLType: string = 'INTEGER',
        pkJSType: JSPrimaryType = 'number',
        foreignCrud: Crud<T>
    ) {
        super(pkSQLType, pkJSType, 'object');
        this.pkPropName = pkPropName;
        this.pkType = pkJSType;
        this.foreignCrud = foreignCrud;
    }

    protected inputHandler(data: T) {
        return data[this.pkPropName];
    }
    protected async outputHandler(data: any): Promise<T> {
        const obj = await this.foreignCrud.get({ [this.pkPropName]: data });
        return obj;
    }

}