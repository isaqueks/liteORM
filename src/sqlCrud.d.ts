import { PowerSQLTable } from "powersql";
import { Crud } from "..";
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
export default abstract class SQLCrud<T> extends Crud<T> {
    /**
     * The data model
     */
    abstract get model(): ObjectModel;
    /**
     * The database to store/retreive data
     */
    abstract get database(): DbInterface;
    abstract set database(value: DbInterface);
    /**
     * The table built based on the model
     */
    abstract get table(): PowerSQLTable;
    /**
     * @depreceated Use setup() instead
     */
    createTableIfNotExists(): Promise<void>;
    /**
     * Creates the table
     */
    abstract setup(): Promise<void>;
    /**
     * Query the database and returns the output
     * @param sql The SQL query
     */
    protected abstract query(sql: string): Promise<T[]>;
    /**
     * Inserts data to the database
     * @param data The data to insert
     */
    abstract insert(data: T): Promise<void>;
    /**
     *
     * @param searchKeys The search keys
     */
    abstract get(searchKeys: any): Promise<T>;
    /**
     *
     * @param searchKeys The search keys to define the rows to be updated
     * @param dataToUpdate The data to update
     */
    abstract update(searchKeys: any, dataToUpdate: any): Promise<void>;
    /**
     * Deletes database rows
     * @param searchKeys The search keys to delete
     */
    abstract delete(searchKeys: any): Promise<void>;
    /**
     * Inserts each item of the data array into the database
     * @param data The data array to insert into the database
     */
    abstract insertMultiple(data: T[]): Promise<void>;
    /**
     * Get multiple data from the database
     * @param searchKeys The keys to search
     */
    abstract getMultiple(searchKeys: any): Promise<T[]>;
    /**
     * Returns all database data
     */
    abstract getAll(): Promise<T[]>;
    /**
     * Custom SQL search
     * @param search The SQL search
     */
    abstract search(search: SQLSearch): Promise<T[]>;
}
