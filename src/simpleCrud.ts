import { PowerSQL, PowerSQLDefaults, PowerSQLStatementResult, PowerSQLTable, PowerSQLTableColumn } from "powersql";
import DbInterface from "./dbInterface";
import checkSQLIdentifierName from "./nameCheck";
import ObjectModel from "./objectModel";
import SQLCrud, { DataInputHandler, DataOutputHandler, SQLSearch, SQLSearchCondition } from "./sqlCrud";
import VirtualType from "./virtualType";


export default class SimpleCrud<T> extends SQLCrud<T> {

    private _inputHandler: DataInputHandler<T>;
    private _outputHandler: DataOutputHandler<T>;

    protected _model: ObjectModel;
    protected _database: DbInterface;
    protected _table: PowerSQLTable;

    // #region Getters and Setters

    /**
     * The data model
     */
    public get model(): ObjectModel {
        return this._model;
    }

    /**
     * The database to store/retreive data
     */
    public get database(): DbInterface {
        return this._database;
    }

    public set database(value: DbInterface) {
        this._database = value;
    }

    /**
     * The table built based on the model
     */
    public get table(): PowerSQLTable {
        return this._table;
    }

    // #endregion

    protected buildPowerSQLTable(tableName: string): PowerSQLTable {

        if (!checkSQLIdentifierName(tableName)) {
            throw new Error(`Invalid table name: ${tableName}`);
        }

        const columns: PowerSQLTableColumn[] = [];
        for (const field of this.model.getFieldArray()) {
            let sqlType = field.sqlType;
            if (typeof sqlType === 'object') {
                const vType = sqlType as VirtualType<any, any>;
                // It is an object. Let's assume it's a VirtualType,
                // but let's check first= {k: v for k, v in sorted(idAccess.items(), key=lambda item: -
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
    /**
     * @deprecated Use setup() instead
     */
    public createTableIfNotExists(): Promise<void> {
        return this.setup();
    }

    /**
     * Creates the table
     */
    public async setup(): Promise<void> {
        return await this._database.promise(
            ...PowerSQL(
                PowerSQLDefaults.createTable(this._table, true)
            )
        );
    }

    // #region Getters

    public get inputHandler(): DataInputHandler<T> {
        return this._inputHandler;
    }

    public get outputHandler(): DataOutputHandler<T> {
        return this._outputHandler;
    }

    // #endregion

    constructor(
        database: DbInterface,
        model: ObjectModel, 
        tableName: string,
        inputHandler?: DataInputHandler<T>,
        outputHandler?: DataOutputHandler<T>
    ) {
        super();
        this._database = database;
        this._model = model;
        this._table = this.buildPowerSQLTable(tableName);
        this._inputHandler = inputHandler;
        this._outputHandler = outputHandler;
    }

    private getWhereQuery(searchKeys: any, joint: string = 'AND'): PowerSQLStatementResult {
        
        const whereConditions = [];   
        const params = []; 

        for (let columnName in searchKeys) {
            const columnValue = searchKeys[columnName];

            const column = this.table.getColumn(columnName);
            if (!column) {
                throw new Error(`Column "${columnName}" does not exists at table ${this.table.name}!`);
            }
            
            const statement = PowerSQLDefaults.equal(
                column.name, columnValue
            );
            whereConditions.push(statement[0]);
            params.push(...statement[1]);
        }

        return [ whereConditions.join(` ${joint} `), params ];
    }

    private removePK(data: T): T {
        const copy = new Object();
        for (const field of this.model.getFieldArray()) {
            if (field.sqlAttributes.includes('PRIMARY KEY') || field.sqlAttributes.includes('PRIMARY_KEY')) {
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(data, field.name)) {
                copy[field.name] = data[field.name];
            }
        }
        return copy as any;
    }

    private removePKArray(data: T[]): T[] {
        const arr = []
        for (const item of data) {
            arr.push(this.removePK(item));
        }
        return arr;
    }

    protected async handleOutput(dbItem: any): Promise<any> {
        dbItem = Object.assign({}, dbItem);
        // Do virtual type output stuff
        for (const field of this.model.getFieldArray()) {
            if (VirtualType.isVirtualType(field.sqlType)) {
                const vtype = field.sqlType as VirtualType<any, any>;
                dbItem[field.name] = await vtype.handleOutput(dbItem[field.name]);
            }
        }
        if (this._outputHandler) {
            dbItem = await this._outputHandler(dbItem);
        }
        return dbItem;
    }

    protected filterColumns(data: any): any {
        const filtered = {};
        for (const field of this.model.getFieldArray()) {
            if (Object.prototype.hasOwnProperty.call(data, field.name)) {
                filtered[field.name] = data[field.name];
            }
        }
        return filtered;
    }

    protected async handleInput(item: T): Promise<any> {
        item = Object.assign({}, item);
    
        if (this._inputHandler) {
            item = await this._inputHandler(item);
        }

        // Do virtual type output stuff
        for (const field of this.model.getFieldArray()) {
            if (VirtualType.isVirtualType(field.sqlType)) {
                const vtype = field.sqlType as VirtualType<any, any>;
                item[field.name] = await vtype.handleInput(item[field.name]);
            }
        }

        // Now, let's filter the values
        // and get only the fields defined in the model

        return this.filterColumns(item);
    }

    protected async query(sql: string, params?: any[]): Promise<T[]> {
        const data: any[] = await this.database.promise(sql, params);
        if (!Array.isArray(data)) {
            if (data) {
                throw new Error(`Invalid data received: ${JSON.stringify(data)}`);
            }
            return null;
        }

        
        return await Promise.all(data.map((singleData) => this.handleOutput(singleData))) as T[];
    }

    public async insert(data: T): Promise<void> {
        
        data = this.removePK(data);
        data = await this.handleInput(data);


        return await this.database.promise(
            ...PowerSQL(
                PowerSQLDefaults.insertInto(this.table, data)
            )
        )
    }

    public async get(searchKeys: any): Promise<T> {
        const dataArray = await this.query(
            ...PowerSQL(
                PowerSQLDefaults.selectWhere(this.table, searchKeys),
                'LIMIT 1'
            )
        )
        if (!dataArray) {
            return null;
        }
        return dataArray[0];
    }

    public async update(searchKeys: any, dataToUpdate: any): Promise<void> {
        
        dataToUpdate = await this.handleInput(dataToUpdate);
        const where = this.getWhereQuery(searchKeys);

        return await this.database.promise(
            ...PowerSQL(
                PowerSQLDefaults.update(this.table),
                PowerSQLDefaults.set(dataToUpdate),
                PowerSQLDefaults.where(where)
            )
        );
    }

    public async delete(searchKeys: any): Promise<void> {

        const filtered = this.filterColumns(searchKeys);

        const where = this.getWhereQuery(filtered);
        
        return await this.database.promise(
            ...PowerSQL(
                'DELETE',
                PowerSQLDefaults.from(this.table),
                PowerSQLDefaults.where(where)
            )
        );
    }

    public async insertMultiple(data: T[]): Promise<void> {
        const promises = [];
        for (const item of data) {
            promises.push(this.insert(item));
        }
        await Promise.all(promises);
    }

    public async getMultiple(searchKeys: any): Promise<T[]> {
        const dataArray = await this.query(
            ...PowerSQL(
                PowerSQLDefaults.selectWhere(this.table, searchKeys)
            )
        )
        if (!dataArray) {
            return [];
        }
        return dataArray;
    }

    public async getAll(): Promise<T[]> {
        return await this.query(
            ...PowerSQL(
                PowerSQLDefaults.select('*'),
                PowerSQLDefaults.from(this.table)
            )
        );
    }

    public async search(search: SQLSearch): Promise<T[]> {

        const query = [];
        const params = [];

        for (const term of search) {
            if (typeof term === 'string') {
                query.push(term);
            }
            else if (typeof term === 'object') {
                const searchCond = term as SQLSearchCondition;
                const searchField = Object.keys(searchCond)[0];
                const field = this.model.getField(searchField);
                if (!field) {
                    throw new Error(`Column "${searchField}" does not exists on table "${this.table.name}".!`);
                }
                const searchData = searchCond[searchField];
                params.push(searchData.value);
                query.push([
                    searchField,
                    searchData.compare,
                    '?'
                ].join(' '));
            }
            else {
                throw new Error(`Unknown search term: ${term}`);
            }
        }

        return await this.query(...PowerSQL(
            PowerSQLDefaults.select('*'),
            PowerSQLDefaults.from(this.table),
            PowerSQLDefaults.where([ query.join(' '), params ])
        ));

    }


    /**
     * @deprecated Use search() instead
     * @param search The SQL search
     * @returns The search result
     */
    public deepSearch(search: SQLSearch): Promise<T[]> { 
        return this.search(search);
    }



}