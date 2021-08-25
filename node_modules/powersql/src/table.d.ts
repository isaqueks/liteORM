declare class PowerSQLTableColumn {
    name: string;
    type: string;
    attributes: Array<string>;
    constructor(Name: string, Type: string, Attributes?: Array<string>);
}
declare class PowerSQLTable {
    name: string;
    columns: Array<PowerSQLTableColumn>;
    constructor(Name: string, Columns: Array<PowerSQLTableColumn>);
    getColumn(columnName: string): PowerSQLTableColumn | null;
    hasColumn(columnName: string, type?: string | undefined): boolean;
}
export { PowerSQLTable, PowerSQLTableColumn };
