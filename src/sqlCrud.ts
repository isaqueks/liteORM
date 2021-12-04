import { PowerSQL, PowerSQLDefaults, PowerSQLTable, PowerSQLTableColumn } from "powersql";
import { Crud } from "..";
import DbInterface from "./dbInterface";
import checkSQLIdentifierName from "./nameCheck";
import ObjectModel from "./objectModel";
import VirtualType from "./virtualType";

export type DataInputHandler<T> = (data: T) => any | Promise<any>;
export type DataOutputHandler<T> = (data: any) => T | Promise<T>;

export interface SQLSearchCondition {
    [field: string]: {
        value: any;
        compare: string;
    }
}


export type SQLBooleanComparsion = 'AND' | 'OR';
export type SQLSearch = Array<SQLSearchCondition|SQLBooleanComparsion>;

export default abstract class SQLCrud<T> extends Crud<T> {
    /**
     * The data model
     */
    public abstract get model(): ObjectModel;

    /**
     * The database to store/retreive data
     */
    public abstract get database(): DbInterface;

    public abstract set database(value: DbInterface);

    /**
     * The table built based on the model
     */
    public abstract get table(): PowerSQLTable;

    /**
     * @depreceated Use setup() instead
     */
    public createTableIfNotExists(): Promise<void> {
        return this.setup();
    }

    /**
     * Creates the table
     */
    public abstract setup(): Promise<void>;


    /**
     * Query the database and returns the output
     * @param sql The SQL query
     */
    protected abstract query(sql: string): Promise<T[]>;
    
    /**
     * Inserts data to the database
     * @param data The data to insert
     */
    public abstract insert(data: T): Promise<void>;

    /**
     * 
     * @param searchKeys The search keys
     */
    public abstract get(searchKeys: any): Promise<T>;

    /**
     * 
     * @param searchKeys The search keys to define the rows to be updated
     * @param dataToUpdate The data to update
     */
    public abstract update(searchKeys: any, dataToUpdate: any): Promise<void>;

    /**
     * Deletes database rows
     * @param searchKeys The search keys to delete
     */
    public abstract delete(searchKeys: any): Promise<void>;

    /**
     * Inserts each item of the data array into the database
     * @param data The data array to insert into the database
     */
    public abstract insertMultiple(data: T[]): Promise<void>;

    /**
     * Get multiple data from the database
     * @param searchKeys The keys to search
     */
    public abstract getMultiple(searchKeys: any): Promise<T[]>;


    /**
     * Returns all database data
     */
    public abstract getAll(): Promise<T[]>;

    /**
     * Custom SQL search
     * @param search The SQL search
     */
    public abstract search(search: SQLSearch): Promise<T[]>;

}