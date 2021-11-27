import Crud from "./crud";
import DbInterface from "./dbInterface";
import ObjectModel from "./objectModel";
export declare type DataInputHandler<T> = (data: T) => any | Promise<any>;
export declare type DataOutputHandler<T> = (data: any) => T | Promise<T>;
export interface SQLSearchCondition {
    [field: string]: {
        value: any;
        compare: string;
    };
}
export declare type SQLBooleanComparsion = 'AND' | 'OR';
export declare type SQLSearch = Array<SQLSearchCondition | SQLBooleanComparsion>;
export default class SimpleCrud<T> extends Crud<T> {
    private _inputHandler;
    private _outputHandler;
    get inputHandler(): DataInputHandler<T>;
    get outputHandler(): DataOutputHandler<T>;
    constructor(database: DbInterface, model: ObjectModel, tableName: string, inputHandler?: DataInputHandler<T>, outputHandler?: DataOutputHandler<T>);
    private getWhereQuery;
    private removePK;
    private removePKArray;
    protected handleOutput(dbItem: any): Promise<any>;
    protected handleInput(item: T): Promise<any>;
    protected query(sql: string, params?: any[]): Promise<T[]>;
    insert(data: T): Promise<void>;
    get(searchKeys: any): Promise<T>;
    update(searchKeys: any, dataToUpdate: any): Promise<void>;
    delete(searchKeys: any): Promise<void>;
    insertMultiple(data: T[]): Promise<void>;
    getMultiple(searchKeys: any): Promise<T[]>;
    getAll(): Promise<T[]>;
    deepSearch(search: SQLSearch): Promise<T[]>;
}
