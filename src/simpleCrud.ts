import { PowerSQL, PowerSQLDefaults } from "powersql";
import Crud from "./Crud";
import DbInterface from "./dbInterface";
import ObjectModel from "./objectModel";

export type DataInputHandler<T> = (data: T) => any;
export type DataOutputHandler<T> = (data: any) => T;

export interface SQLSearchCondition {
    [field: string]: {
        value: any;
        compare: string;
    }
}


export type SQLBooleanComparsion = 'AND' | 'OR';
export type SQLSearch = Array<SQLSearchCondition|SQLBooleanComparsion>;


const x = [{
    name: {
        value: 'John',
        compare: 'LIKE',

    },
}, 'AND', {

}]

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

    private getWhereQuery(searchKeys: any, joint: string = 'AND'): string {
        let whereConditions = [];    

        for (let columnName in searchKeys) {
            const columnValue = searchKeys[columnName];

            const column = this.table.getColumn(columnName);
            if (!this.table) {
                throw new Error(`Column "${columnName}" does not exists at table ${this.table.name}!`);
            }
            
            whereConditions.push(PowerSQLDefaults.equal(column.name, PowerSQLDefaults.param(columnValue, column.type)));
        }

        return whereConditions.join(` ${joint} `);
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

    protected async query(sql: string): Promise<T[]> {
        const data: any[] = await this.database.promise(sql);
        if (!Array.isArray(data)) {
            if (data) {
                throw new Error(`Invalid data received: ${JSON.stringify(data)}`);
            }
            return null;
        }

        if (this._outputHandler) {
            data.map((singleData) => {
                singleData = this._outputHandler(singleData);
            });
        }

        return data as T[];
    }

    public async insert(data: T): Promise<void> {
        data = this.removePK(data);
        if (this._inputHandler) {
            data = this._inputHandler(data);
        }
        return await this.database.promise(
            PowerSQL(
                PowerSQLDefaults.insertInto(this.table, data)
            )
        )
    }

    public async get(searchKeys: any): Promise<T> {
        const dataArray = await this.query(
            PowerSQL(
                PowerSQLDefaults.selectObject(this.table, searchKeys),
                'LIMIT 1'
            )
        )
        if (!dataArray) {
            return null;
        }
        return dataArray[0];
    }

    public async update(searchKeys: any, dataToUpdate: any): Promise<void> {
        
        const where = this.getWhereQuery(searchKeys);

        if (this._inputHandler) {
            dataToUpdate = this._inputHandler(dataToUpdate);
        }

        return await this.database.promise(
            PowerSQL(
                PowerSQLDefaults.update(this.table),
                PowerSQLDefaults.set(dataToUpdate),
                PowerSQLDefaults.where(where)
            )
        );
    }

    public async delete(searchKeys: any): Promise<void> {
        const where = this.getWhereQuery(searchKeys);
        return await this.database.promise(
            PowerSQL(
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
            PowerSQL(
                PowerSQLDefaults.selectObject(this.table, searchKeys)
            )
        )
        if (!dataArray) {
            return [];
        }
        return dataArray;
    }

    public async getAll(): Promise<T[]> {
        return await this.query(
            PowerSQL(
                PowerSQLDefaults.select('*'),
                PowerSQLDefaults.from(this.table)
            )
        );
    }

    public async deepSearch(search: SQLSearch): Promise<T[]> {

        let query = []

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
                query.push([
                    searchField,
                    searchData.compare,
                    PowerSQLDefaults.param(
                        searchData.value,
                        field.sqlType
                    )
                ].join(' '));
            }
            else {
                throw new Error(`Unknown search term: ${term}`);
            }
        }

        return await this.query(PowerSQL(
            PowerSQLDefaults.select('*'),
            PowerSQLDefaults.from(this.table),
            PowerSQLDefaults.where(query.join(' '))
        ));

    }



}