interface DbInterface {
    promise(sql: string, data?: any[]): Promise<any>;
}
export default DbInterface;
