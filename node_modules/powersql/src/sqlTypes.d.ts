declare function getSqlTypes(jsType: string): string[] | null;
declare function getJsType(sqlType: string): string | null;
declare function sqlEscapeToString(value: any, jsType: any): string;
declare const sqlTypes: {
    getJsType: typeof getJsType;
    getSqlTypes: typeof getSqlTypes;
    sqlEscapeToString: typeof sqlEscapeToString;
};
export default sqlTypes;
