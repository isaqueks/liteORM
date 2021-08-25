import { PowerSQLTable } from "powersql";
import DbInterface from "./dbInterface";
import ObjectModel from "./objectModel";
export default abstract class Crud<T> {
    private _model;
    private _database;
    private _table;
    get model(): ObjectModel;
    set model(value: ObjectModel);
    get database(): DbInterface;
    set database(value: DbInterface);
    get table(): PowerSQLTable;
    set table(value: PowerSQLTable);
    private buildPowerSQLTable;
    protected constructor(database: DbInterface, model: ObjectModel, tableName: string);
    /**
     * Creates the table (if not exists)
     */
    createTableIfNotExists(): Promise<void>;
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
}
