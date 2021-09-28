import { PowerSQL, PowerSQLDefaults, PowerSQLTable, PowerSQLTableColumn } from "powersql";
import DbInterface from "./dbInterface";
import ObjectModel from "./objectModel";
import VirtualType, { VTYPE_SIGNATURE, VTYPE_SIGNATURE_PROP } from "./virtualType";

export default abstract class Crud<T> {

    private _model: ObjectModel;
    private _database: DbInterface;
    private _table: PowerSQLTable;

    // #region Getters and Setters
    public get model(): ObjectModel {
        return this._model;
    }
    public set model(value: ObjectModel) {
        this._model = value;
    }

    public get database(): DbInterface {
        return this._database;
    }
    public set database(value: DbInterface) {
        this._database = value;
    }

    public get table(): PowerSQLTable {
        return this._table;
    }
    public set table(value: PowerSQLTable) {
        this._table = value;
    }
    // #endregion

    private buildPowerSQLTable(tableName: string): PowerSQLTable {
        const columns: PowerSQLTableColumn[] = [];
        for (const field of this.model.fields) {
            let sqlType = field.sqlType;
            if (typeof sqlType === 'object') {
                const vType = sqlType as VirtualType<any, any>;
                // It is an object. Let's assume it's a VirtualType,
                // but let's check first
                if (VirtualType.isVirtualType(vType)) {
                    sqlType = vType.outputSQLType;
                }
                else {
                    throw new Error(`Field type should be a plain SQL type or a VirtualType! Got "${vType}" (${typeof vType}).`);
                }
            } 
            columns.push(
                new PowerSQLTableColumn(
                    field.name, 
                    sqlType, 
                    field.sqlAttributes
                )
            );
        }

        return new PowerSQLTable(tableName, columns);
    }

    protected constructor(database: DbInterface, model: ObjectModel, tableName: string) {
        this.database = database;
        this.model = model;
        this.table = this.buildPowerSQLTable(tableName);
    }

    /**
     * Creates the table (if not exists)
     */
    public async createTableIfNotExists(): Promise<void> {
        return await this._database.promise(
            ...PowerSQL(
                PowerSQLDefaults.createTable(this._table, true)
            )
        );
    }


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

}