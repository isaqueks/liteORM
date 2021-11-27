import { PowerSQL, PowerSQLDefaults, PowerSQLStatementResult } from "powersql";
import Crud from "./crud";
import DbInterface from "./dbInterface";
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


export default class SimpleCrud<T> extends Crud<T> {

    private _inputHandler: DataInputHandler<T>;
    private _outputHandler: DataOutputHandler<T>;

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
        super(database, model, tableName);
        this._inputHandler = inputHandler;
        this._outputHandler = outputHandler;
    }

    private getWhereQuery(searchKeys: any, joint: string = 'AND'): PowerSQLStatementResult {
        
        const whereConditions = [];   
        const params = []; 

        for (let columnName in searchKeys) {
            const columnValue = searchKeys[columnName];

            const column = this.table.getColumn(columnName);
            if (!this.table) {
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
        const copy = {};
        for (const field of this.model.fields) {
            if (field.sqlAttributes.includes('PRIMARY KEY')) {
                continue;
            }
            copy[field.name] = data[field.name];
        }
        return copy as T;
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
        for (const field of this.model.fields) {
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

    protected async handleInput(item: T): Promise<any> {
        item = Object.assign({}, item);
        // Do virtual type output stuff
        for (const field of this.model.fields) {
            if (VirtualType.isVirtualType(field.sqlType)) {
                const vtype = field.sqlType as VirtualType<any, any>;
                item[field.name] = await vtype.handleInput(item[field.name]);
            }
        }
        if (this._inputHandler) {
            item = await this._inputHandler(item);
        }

        // Now, let's filter the values
        // and get only the fields defined in the model

        const filtered = {};
        for (const field of this.model.fields) {
            if (Object.prototype.hasOwnProperty.call(item, field.name)) {
                filtered[field.name] = item[field.name];
            }
        }

        return filtered;
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
        const where = this.getWhereQuery(searchKeys);
        
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

    public async deepSearch(search: SQLSearch): Promise<T[]> {

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
                    throw new Error(`Invalid field "${searchField}"!`);
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



}