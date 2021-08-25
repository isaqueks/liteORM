import PowerSQLStatementTemplate from "./powerSqlStatementTemplate";
interface PowerSQLStatement {
    (...args: any[]): string;
    template: PowerSQLStatementTemplate;
}
declare function PowerSQLStatementFactory(template: string, executor: Function): PowerSQLStatement;
export { PowerSQLStatement, PowerSQLStatementFactory };
