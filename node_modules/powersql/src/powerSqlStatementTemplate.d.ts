declare class PowerSQLStatementTemplate {
    template: string;
    execute: Function;
    constructor(Template: string, Execute: Function);
    toSql(...args: any[]): string;
}
export default PowerSQLStatementTemplate;
