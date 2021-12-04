import { PowerSQLTable } from "powersql";
import DbInterface from "./dbInterface";
import ObjectModel from "./objectModel";
import SQLCrud, { DataInputHandler, DataOutputHandler, SQLSearch } from "./sqlCrud";
export default class SimpleCrud<T> extends SQLCrud<T> {
    private _inputHandler;
    private _outputHandler;
    protected _model: ObjectModel;
    protected _database: DbInterface;
    protected _table: PowerSQLTable;
    /**
     * The data model
     */
    get model(): ObjectModel;
    /**
     * The database to store/retreive data
     */
    get database(): DbInterface;
    set database(value: DbInterface);
    /**
     * The table built based on the model
     */
    get table(): PowerSQLTable;
    protected buildPowerSQLTable(tableName: string): PowerSQLTable;
    /**
     * @depreceated Use setup() instead
     */
    createTableIfNotExists(): Promise<void>;
    /**
     * Creates the table
     */
    setup(): Promise<void>;
    get inputHandler(): DataInputHandler<T>;
    get outputHandler(): DataOutputHandler<T>;
    constructor(database: DbInterface, model: ObjectModel, tableName: string, inputHandler?: DataInputHandler<T>, outputHandler?: DataOutputHandler<T>);
    private getWhereQuery;
    private removePK;
    private removePKArray;
    protected handleOutput(dbItem: any): Promise<any>;
    protected filterColumns(data: any): any;
    protected handleInput(item: T): Promise<any>;
    protected query(sql: string, params?: any[]): Promise<T[]>;
    insert(data: T): Promise<void>;
    get(searchKeys: any): Promise<T>;
    update(searchKeys: any, dataToUpdate: any): Promise<void>;
    delete(searchKeys: any): Promise<void>;
    insertMultiple(data: T[]): Promise<void>;
    getMultiple(searchKeys: any): Promise<T[]>;
    getAll(): Promise<T[]>;
    search(search: SQLSearch): Promise<T[]>;
    /**
     * @depreceated Use search() instead
     * @param search The SQL search
     * @returns The search result
     */
    deepSearch(search: SQLSearch): Promise<T[]>;
}
